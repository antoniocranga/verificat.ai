import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:verificat_mobile/core/api/job_api_service.dart';
import 'package:verificat_mobile/core/audio/audio_recorder_service.dart';
import 'package:verificat_mobile/core/audio/audio_session_service.dart';
import 'package:verificat_mobile/core/permissions/permission_service.dart';
import '../../domain/repositories/listening_repository.dart';
import '../services/transcript_stream_service.dart';

class ListeningRepositoryImpl implements ListeningRepository {
  final AudioRecorderService _recorder;
  final JobApiService _api;
  final PermissionService _permissionService;
  final TranscriptStreamService? _streamingService;
  final StreamController<void> _interruptionBeganController = StreamController<void>.broadcast();
  final StreamController<void> _interruptionEndedController = StreamController<void>.broadcast();
  // ignore: unused_field
  StreamSubscription<AudioSessionInterruption>? _interruptionSub;
  File? _audioFile;

  ListeningRepositoryImpl({
    AudioRecorderService? recorder,
    JobApiService? api,
    PermissionService? permissionService,
    TranscriptStreamService? streamingService,
  }) : _recorder = recorder ?? AudioRecorderService(),
       _api = api ?? JobApiService(),
        _permissionService = permissionService ?? const PermissionService(),
        _streamingService = streamingService {
    _interruptionSub = _recorder.onInterruption.listen((event) {
      switch (event) {
        case AudioSessionInterruption.began:
          _interruptionBeganController.add(null);
        case AudioSessionInterruption.ended:
          _interruptionEndedController.add(null);
      }
    });
  }

  @override
  Stream<void> get onInterruptionBegan => _interruptionBeganController.stream;

  @override
  Stream<void> get onInterruptionEnded => _interruptionEndedController.stream;

  @override
  Future<String> startRecording() => _recorder.startRecording();

  @override
  Future<void> stopRecording() async {
    _audioFile = await _recorder.stopRecording();
  }

  @override
  Future<String?> uploadAndVerify() async {
    if (_audioFile == null) {
      debugPrint('[ListeningRepo] uploadAndVerify: _audioFile is null');
      return null;
    }
    debugPrint('[ListeningRepo] uploadAndVerify: file=${_audioFile!.path}, size=${_audioFile!.lengthSync()}');
    final result = await _api.uploadAudio(_audioFile!);
    _audioFile = null;
    debugPrint('[ListeningRepo] uploadAndVerify: result=$result');
    return result['jobId']?.toString();
  }

  @override
  Future<Map<String, dynamic>> verifyText(String text) async {
    return _api.verifyText(text);
  }

  @override
  Future<String?> transcribeAudio() async {
    try {
      if (_audioFile == null) return null;
      debugPrint('[ListeningRepo] transcribeAudio: file=${_audioFile!.path}');

      final transcript = await _api.transcribeAudio(_audioFile!);
      _audioFile = null;
      debugPrint('[ListeningRepo] transcribeAudio done');
      return transcript;
    } catch (e, st) {
      debugPrint('[ListeningRepo] transcribeAudio failed: $e\n$st');
      rethrow;
    }
  }

  @override
  Stream<Map<String, dynamic>> streamJobEvents(String jobId) {
    return _api.streamJobEvents(jobId);
  }

  @override
  TranscriptStreamService? get streamingService => _streamingService;

  @override
  Future<void> startStreaming() async {
    final granted = await _permissionService.requestMicPermission();
    if (!granted) throw Exception('Microphone permission denied');
    if (_streamingService == null) throw Exception('Streaming service not available');
    await _streamingService.start();
  }

  @override
  Future<void> stopStreaming() async {
    await _streamingService?.stop();
  }

  @override
  Stream<dynamic> onAmplitude() {
    return _recorder.onAmplitude();
  }

  @override
  Future<bool> requestMicPermission() => _permissionService.requestMicPermission();
}
