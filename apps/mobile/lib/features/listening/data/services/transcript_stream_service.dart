import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:record/record.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:uuid/uuid.dart';
import '../../../../core/env/env.dart';
import '../../domain/entities/transcript_segment.dart';

/// Real-time streaming transcript service.
///
/// Opens a WebSocket to the NestJS backend and pipes raw PCM audio from
/// the device microphone at 16kHz mono. Handles:
/// - Per-message JSON parsing (interim / final / result / error)
/// - Segment lifecycle (interim → final → verdict applied)
/// - Exponential-backoff reconnection (up to [_maxRetries] attempts)
/// - Clean teardown on [stop]
///
/// Consume via [ChangeNotifier] / [ListenableBuilder] or [Provider].
class TranscriptStreamService extends ChangeNotifier {
  static String _wsUrl(String? sessionId) {
    final apiUrl = AppEnv.apiUrl;
    final wsBase = apiUrl.startsWith('https')
        ? apiUrl.replaceFirst('https', 'wss')
        : apiUrl.replaceFirst('http', 'ws');
    
    if (sessionId != null && sessionId.isNotEmpty) {
      return '$wsBase/audio?sessionId=$sessionId';
    }
    return '$wsBase/audio';
  }
  static const int _maxRetries = 5;

  final AudioRecorder _recorder;
  final Uuid _uuid;

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _audioSub;
  StreamSubscription<dynamic>? _wsSub;

  final List<TranscriptSegment> _segments = [];
  String _interimText = '';
  int _canonicalLength = 0;
  bool _isRecording = false;
  int _retryCount = 0;
  bool _isDisposed = false;
  bool _isReconnecting = false;
  String? _sessionId;
  final void Function(String message)? onError;

  TranscriptStreamService({
    AudioRecorder? recorder,
    Uuid? uuid,
    this.onError,
  })  : _recorder = recorder ?? AudioRecorder(),
        _uuid = uuid ?? const Uuid();

  // ─── Public state ─────────────────────────────────────────────────────────

  List<TranscriptSegment> get segments => List.unmodifiable(_segments);
  String get interimText => _interimText;
  bool get isRecording => _isRecording;
  bool get isReconnecting => _isReconnecting;
  String? get sessionId => _sessionId;

  // ─── Control ──────────────────────────────────────────────────────────────

  /// Starts microphone capture and WebSocket streaming.
  /// Throws if microphone permission is not granted.
  Future<void> start() async {
    final granted = await _recorder.hasPermission();
    if (!granted) throw Exception('Microphone permission denied');

    _isRecording = true;
    _segments.clear();
    _interimText = '';
    _retryCount = 0;
    _isReconnecting = false;
    _sessionId = null;
    notifyListeners();

    await _connect();
  }

  /// Pauses stream without dropping connection (e.g., backgrounding)
  Future<void> pauseStream() async {
    if (!_isRecording || _channel == null) return;
    
    await _audioSub?.cancel();
    _audioSub = null;
    await _recorder.stop();
    
    if (_sessionId != null) {
      _channel?.sink.add(jsonEncode({
        'type': 'client_pause',
        'sessionId': _sessionId,
      }));
    }
    notifyListeners();
  }

  /// Resumes stream after pause
  Future<void> resumeStream() async {
    if (!_isRecording) return;
    
    if (_channel != null && _sessionId != null) {
      _channel?.sink.add(jsonEncode({
        'type': 'client_resume',
        'sessionId': _sessionId,
      }));
      
      final audioStream = await _recorder.startStream(const RecordConfig(
        encoder: AudioEncoder.pcm16bits,
        sampleRate: 16000,
        numChannels: 1,
      ));
      _audioSub = audioStream.listen((chunk) {
        if (_channel != null) {
          _channel!.sink.add(chunk);
        }
      });
      notifyListeners();
    } else {
      await _connect();
    }
  }

  /// Stops capture, closes the WebSocket, and cleans up all resources.
  Future<void> stop() async {
    _isRecording = false;
    _isReconnecting = false;
    await _audioSub?.cancel();
    _audioSub = null;
    await _recorder.stop();
    await _wsSub?.cancel();
    _wsSub = null;
    await _channel?.sink.close();
    _channel = null;
    notifyListeners();
  }

  // ─── Connection lifecycle ─────────────────────────────────────────────────

  Future<void> _connect() async {
    try {
      _channel = WebSocketChannel.connect(Uri.parse(_wsUrl(_sessionId)));

      _wsSub = _channel!.stream.listen(
        _onServerMessage,
        onError: _onWsError,
        onDone: _onWsDone,
      );

      final audioStream = await _recorder.startStream(const RecordConfig(
        encoder: AudioEncoder.pcm16bits,
        sampleRate: 16000,
        numChannels: 1,
      ));

      _audioSub = audioStream.listen((chunk) {
        if (_channel != null) {
          _channel!.sink.add(chunk);
        }
      });

      _retryCount = 0;
      _isReconnecting = false;
      notifyListeners();
    } catch (_) {
      _scheduleReconnect();
    }
  }

  // ─── Message handling ─────────────────────────────────────────────────────

  void _onServerMessage(dynamic raw) {
    if (raw is! String) return;
    final Map<String, dynamic> msg;
    try {
      msg = jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return;
    }

    final type = msg['type'] as String?;
    debugPrint('[TranscriptStreamService] WS message received: type=$type');

    switch (type) {
      case 'transcript_sync':
        if (msg['sessionId'] != null) {
          _sessionId = msg['sessionId'] as String;
        }
        break;

      case 'interim':
        _interimText = (msg['text'] as String?) ?? '';
        notifyListeners();

      case 'final':
        if (msg['sessionId'] != null) {
          _sessionId = msg['sessionId'] as String;
        }
        _interimText = '';
        final text = (msg['text'] as String?) ?? '';
        final startOffset = _canonicalLength == 0 ? 0 : _canonicalLength + 1;
        final endOffset = startOffset + text.length;
        
        if (_canonicalLength > 0) {
          _canonicalLength += 1;
        }
        _canonicalLength += text.length;

        _segments.add(TranscriptSegment(
          segmentId: (msg['segmentId'] as String?) ?? _uuid.v4(),
          text: text,
          canonicalStart: startOffset,
          canonicalEnd: endOffset,
        ));
        notifyListeners();

      case 'result':
        // Legacy result no longer drives highlighting. It only provides plain updates if needed.
        final segId = msg['segmentId'] as String?;
        if (segId == null) return;
        final idx = _segments.indexWhere((s) => s.segmentId == segId);
        if (idx != -1) {
          _segments[idx] = _segments[idx].withVerdict(
            verdict: streamingVerdictFromString((msg['status'] ?? msg['verdict']) as String?),
            confidence: (msg['confidence'] as num?)?.toDouble(),
            explanation: msg['explanation'] as String?,
            sources: List<String>.from(msg['sources'] as List? ?? []),
            matchedFact: msg['matchedFact'] as String?,
          );
          notifyListeners();
        }

      case 'claim_result':
        final offsetMap = msg['offset'] as Map<String, dynamic>?;
        if (offsetMap == null) return;
        
        final claimStart = offsetMap['start'] as int;
        final claimEnd = offsetMap['end'] as int;
        
        final statusStr = (msg['status'] ?? msg['verdict']) as String?;
        final verdict = streamingVerdictFromString(statusStr);
        final confidence = (msg['confidence'] as num?)?.toDouble();
        final explanation = msg['explanation'] as String?;
        final sources = List<String>.from(msg['sources'] as List? ?? []);
        final matchedFact = msg['matchedFact'] as String?;
        
        bool updated = false;
        for (int i = 0; i < _segments.length; i++) {
          final seg = _segments[i];
          final cStart = seg.canonicalStart;
          final cEnd = seg.canonicalEnd;
          
          if (cStart == null || cEnd == null) continue;
          
          if (cStart < claimEnd && cEnd > claimStart) {
            final segStart = (claimStart > cStart ? claimStart : cStart) - cStart;
            final segEnd = (claimEnd < cEnd ? claimEnd : cEnd) - cStart;
            
            _segments[i] = seg.withVerdict(
              verdict: verdict,
              confidence: confidence,
              explanation: explanation,
              sources: sources,
              matchedFact: matchedFact,
              highlightStart: segStart,
              highlightEnd: segEnd,
            );
            
            final safeStart = segStart.clamp(0, seg.text.length);
            final safeEnd = segEnd.clamp(safeStart, seg.text.length);
            final hlSubstring = seg.text.substring(safeStart, safeEnd);
            debugPrint('[TranscriptStreamService] Applied highlight claimId=${msg['claimId']} to substring: "$hlSubstring"');
            
            updated = true;
          }
        }
        if (updated) notifyListeners();

      case 'claim_error':
        final segId = msg['segmentId'] as String?;
        if (segId == null) return;
        final idx = _segments.indexWhere((s) => s.segmentId == segId);
        if (idx != -1) {
          _segments[idx] = _segments[idx].withVerdict(
            verdict: null,
            confidence: null,
            explanation: null,
            sources: [],
            matchedFact: null,
            claimError: msg['message'] as String?,
          );
          notifyListeners();
        }

      case 'error':
        // Log but don't crash; stream errors are surfaced via the WS done/error path
        debugPrint('[TranscriptStreamService] Server error: ${msg['code']} — ${msg['message']}');
        
      case 'warning':
        debugPrint('[TranscriptStreamService] Warning: ${msg['message']}');
        break;

      default:
        debugPrint('[TranscriptStreamService] WARN: Unhandled WS message type: $type');
    }
  }

  void _onWsError(Object err) => _scheduleReconnect();

  void _onWsDone() {
    if (_isRecording) _scheduleReconnect();
  }

  // ─── Reconnection ─────────────────────────────────────────────────────────

  void _scheduleReconnect() {
    if (_retryCount >= _maxRetries) {
      stop();
      onError?.call('Conexiunea s-a întrerupt și nu s-a putut restabili.');
      return;
    }
    // Exponential backoff: 2, 4, 8, 16, 30 seconds (capped at 30)
    final delaySeconds = (2 << _retryCount).clamp(2, 30);
    _retryCount++;
    _isReconnecting = true;
    notifyListeners();
    
    Future.delayed(Duration(seconds: delaySeconds), () {
      if (_isRecording) _connect();
    });
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  @override
  void notifyListeners() {
    if (!_isDisposed) {
      super.notifyListeners();
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    stop();
    _recorder.dispose();
    super.dispose();
  }
}
