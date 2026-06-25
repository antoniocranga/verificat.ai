import 'dart:async';

abstract class ListeningRepository {
  Future<String> startRecording();
  Future<void> stopRecording();
  Future<String?> uploadAndVerify();
  Stream<Map<String, dynamic>> streamJobEvents(String jobId);
  Future<bool> requestMicPermission();
}
