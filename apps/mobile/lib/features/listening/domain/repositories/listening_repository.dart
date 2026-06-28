import 'dart:async';
import '../../data/services/transcript_stream_service.dart';

abstract class ListeningRepository {
  Future<String> startRecording();
  Future<void> stopRecording();
  Future<String?> uploadAndVerify();
  Future<String?> transcribeAudio();
  Future<Map<String, dynamic>> verifyText(String text);
  Stream<Map<String, dynamic>> streamJobEvents(String jobId);

  // Real-time streaming
  Future<void> startStreaming();
  Future<void> stopStreaming();
  TranscriptStreamService get streamingService;

  Future<bool> requestMicPermission();
  Stream<dynamic> onAmplitude();
  Stream<void> get onInterruptionBegan;
  Stream<void> get onInterruptionEnded;
}
