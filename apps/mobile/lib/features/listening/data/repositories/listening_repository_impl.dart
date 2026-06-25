import 'dart:async';
import 'dart:io';
import 'package:verificat_mobile/core/api/job_api_service.dart';
import 'package:verificat_mobile/core/audio/audio_recorder_service.dart';
import 'package:verificat_mobile/core/permissions/permission_service.dart';
import '../../domain/repositories/listening_repository.dart';

class ListeningRepositoryImpl implements ListeningRepository {
  final AudioRecorderService _recorder;
  final JobApiService _api;
  final PermissionService _permissionService;
  File? _audioFile;

  ListeningRepositoryImpl({
    AudioRecorderService? recorder,
    JobApiService? api,
    PermissionService? permissionService,
  }) : _recorder = recorder ?? AudioRecorderService(),
       _api = api ?? JobApiService(),
       _permissionService = permissionService ?? PermissionService();

  @override
  Future<String> startRecording() => _recorder.startRecording();

  @override
  Future<void> stopRecording() async {
    _audioFile = await _recorder.stopRecording();
  }

  @override
  Future<String?> uploadAndVerify() async {
    if (_audioFile == null) return null;
    final result = await _api.uploadAudio(_audioFile!);
    _audioFile = null;
    return result['jobId'] as String?;
  }

  @override
  Stream<Map<String, dynamic>> streamJobEvents(String jobId) {
    return _api.streamJobEvents(jobId);
  }

  @override
  Future<bool> requestMicPermission() => _permissionService.requestMicPermission();
}
