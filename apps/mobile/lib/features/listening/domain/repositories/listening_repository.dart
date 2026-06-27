import 'dart:async';

abstract class ListeningRepository {
  Future<String> startRecording();
  Future<void> stopRecording();
  Future<String?> uploadAndVerify();
  Future<String?> transcribeAudio();
  Future<Map<String, dynamic>> verifyText(String text);
  Stream<Map<String, dynamic>> streamJobEvents(String jobId);
  Future<bool> requestMicPermission();
  Stream<dynamic> onAmplitude();
  Stream<void> get onInterruptionBegan;
  Stream<void> get onInterruptionEnded;
}
