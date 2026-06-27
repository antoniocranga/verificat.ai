import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:record/record.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:uuid/uuid.dart';
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
  static const String _wsUrl = String.fromEnvironment(
    'AUDIO_WS_URL',
    defaultValue: 'wss://api-staging.verificat.xyz/audio',
  );
  static const int _maxRetries = 5;

  final AudioRecorder _recorder;
  final Uuid _uuid;

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _audioSub;
  StreamSubscription<dynamic>? _wsSub;

  final List<TranscriptSegment> _segments = [];
  String _interimText = '';
  bool _isRecording = false;
  int _retryCount = 0;
  bool _isDisposed = false;

  TranscriptStreamService({
    AudioRecorder? recorder,
    Uuid? uuid,
  })  : _recorder = recorder ?? AudioRecorder(),
        _uuid = uuid ?? const Uuid();

  // ─── Public state ─────────────────────────────────────────────────────────

  List<TranscriptSegment> get segments => List.unmodifiable(_segments);
  String get interimText => _interimText;
  bool get isRecording => _isRecording;

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
    notifyListeners();

    await _connect();
  }

  /// Stops capture, closes the WebSocket, and cleans up all resources.
  Future<void> stop() async {
    _isRecording = false;
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
      _channel = WebSocketChannel.connect(Uri.parse(_wsUrl));

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

    switch (type) {
      case 'interim':
        _interimText = (msg['text'] as String?) ?? '';
        notifyListeners();

      case 'final':
        _interimText = '';
        _segments.add(TranscriptSegment(
          segmentId: (msg['segmentId'] as String?) ?? _uuid.v4(),
          text: (msg['text'] as String?) ?? '',
        ));
        notifyListeners();

      case 'result':
        final segId = msg['segmentId'] as String?;
        if (segId == null) return;
        final idx = _segments.indexWhere((s) => s.segmentId == segId);
        if (idx != -1) {
          _segments[idx] = _segments[idx].withVerdict(
            verdict: streamingVerdictFromString(msg['verdict'] as String?),
            confidence: (msg['confidence'] as num?)?.toDouble(),
            explanation: msg['explanation'] as String?,
            sources: List<String>.from(msg['sources'] as List? ?? []),
            matchedFact: msg['matchedFact'] as String?,
          );
          notifyListeners();
        }

      case 'error':
        // Log but don't crash; stream errors are surfaced via the WS done/error path
        debugPrint('[TranscriptStreamService] Server error: ${msg['code']} — ${msg['message']}');
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
      return;
    }
    // Exponential backoff: 2, 4, 8, 16, 30 seconds (capped at 30)
    final delaySeconds = (2 << _retryCount).clamp(2, 30);
    _retryCount++;
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
