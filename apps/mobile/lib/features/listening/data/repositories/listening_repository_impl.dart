import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:verificat_mobile/core/api/job_api_service.dart';
import 'package:verificat_mobile/core/audio/audio_recorder_service.dart';
import 'package:verificat_mobile/core/audio/audio_session_service.dart';
import 'package:verificat_mobile/core/permissions/permission_service.dart';
import '../../domain/repositories/listening_repository.dart';

class ListeningRepositoryImpl implements ListeningRepository {
  final AudioRecorderService _recorder;
  final JobApiService _api;
  final PermissionService _permissionService;
  final StreamController<void> _interruptionBeganController = StreamController<void>.broadcast();
  final StreamController<void> _interruptionEndedController = StreamController<void>.broadcast();
  // ignore: unused_field
  StreamSubscription<AudioSessionInterruption>? _interruptionSub;
  File? _audioFile;

  ListeningRepositoryImpl({
    AudioRecorderService? recorder,
    JobApiService? api,
    PermissionService? permissionService,
  }) : _recorder = recorder ?? AudioRecorderService(),
       _api = api ?? JobApiService(),
        _permissionService = permissionService ?? const PermissionService() {
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
  Stream<Map<String, dynamic>> streamJobEvents(String jobId) {
    return _api.streamJobEvents(jobId);
  }

  @override
  Future<bool> requestMicPermission() => _permissionService.requestMicPermission();
}
