import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/features/listening/data/services/transcript_stream_service.dart';
import 'package:verificat_mobile/features/listening/domain/repositories/listening_repository.dart';
import 'package:verificat_mobile/features/listening/presentation/bloc/listening_bloc.dart';

class MockListeningRepository implements ListeningRepository {
  final bool grantPermission;
  final bool startRecordingSuccess;
  final String? jobId;
  final Stream<Map<String, dynamic>>? jobStream;
  final Stream<void>? interruptionBegan;
  final Stream<void>? interruptionEnded;
  bool stopRecordingCalled = false;
  bool uploadCalled = false;

  MockListeningRepository({
    this.grantPermission = true,
    this.startRecordingSuccess = true,
    this.jobId,
    this.jobStream,
    this.interruptionBegan,
    this.interruptionEnded,
  });

  @override
  Future<bool> requestMicPermission() async => grantPermission;

  @override
  Future<String> startRecording() async {
    if (!startRecordingSuccess) throw Exception('Recording failed');
    return '/tmp/recording.aac';
  }

  @override
  Future<void> stopRecording() async {
    stopRecordingCalled = true;
  }

  @override
  Future<String?> uploadAndVerify() async {
    uploadCalled = true;
    return jobId;
  }

  @override
  Stream<Map<String, dynamic>> streamJobEvents(String jobId) {
    return jobStream ?? const Stream.empty();
  }

  @override
  Stream<void> get onInterruptionBegan =>
      interruptionBegan ?? const Stream.empty();

  @override
  Stream<void> get onInterruptionEnded =>
      interruptionEnded ?? const Stream.empty();

  @override
  Stream<dynamic> onAmplitude() => const Stream.empty();

  @override
  Future<String?> transcribeAudio() async => 'Test transcript';

  @override
  Future<Map<String, dynamic>> verifyText(String text) async => {'jobId': jobId};

  @override
  Future<void> startStreaming() async {}

  @override
  Future<void> stopStreaming() async {}

  @override
  TranscriptStreamService? get streamingService => null;
}

void main() {
  group('ListeningBloc', () {
    test('initial state is idle', () {
      final bloc = ListeningBloc(
        repository: MockListeningRepository(),
      );
      expect(bloc.state.status, ListeningStatus.idle);
      expect(bloc.state.verdictId, isNull);
      expect(bloc.state.errorMessage, isNull);
      bloc.close();
    });

    test('transitions to listening when mic permission is granted', () async {
      final repo = MockListeningRepository(grantPermission: true);
      final bloc = ListeningBloc(repository: repo);
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);

      expect(states.length, 1);
      expect(states[0].status, ListeningStatus.listening);
      bloc.close();
    });

    test('transitions to error when mic permission is denied', () async {
      final repo = MockListeningRepository(grantPermission: false);
      final bloc = ListeningBloc(repository: repo);
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);

      expect(states.length, 1);
      expect(states[0].status, ListeningStatus.error);
      expect(states[0].errorMessage, isNotNull);
      bloc.close();
    });

    test('transitions to error when recording fails', () async {
      final repo = MockListeningRepository(
        grantPermission: true,
        startRecordingSuccess: false,
      );
      final bloc = ListeningBloc(repository: repo);
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);

      expect(states.length, 1);
      expect(states[0].status, ListeningStatus.error);
      bloc.close();
    });

    test('stop from idle stays idle', () {
      final bloc = ListeningBloc(
        repository: MockListeningRepository(),
      );
      bloc.add(const StopListening());
      expect(bloc.state.status, ListeningStatus.idle);
      bloc.close();
    });

    test('VerdictReady stores claims data', () async {
      final bloc = ListeningBloc(
        repository: MockListeningRepository(grantPermission: true),
      );
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      bloc.add(const VerdictReady([
        {'verdict': 'True', 'confidenceScore': 95, 'explanation': 'OK', 'assertion': 'Test'},
      ]));
      await Future.delayed(Duration.zero);

      expect(states.length, 2);
      expect(states[1].status, ListeningStatus.verdictReady);
      expect(states[1].claimsData, isNotNull);
      expect(states[1].claimsData!.length, 1);
      bloc.close();
    });

    test('ListeningFailed stores error message', () async {
      final bloc = ListeningBloc(
        repository: MockListeningRepository(grantPermission: true),
      );
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      bloc.add(const ListeningFailed('Timeout'));
      await Future.delayed(Duration.zero);

      expect(states.length, 2);
      expect(states[1].status, ListeningStatus.error);
      expect(states[1].errorMessage, 'Timeout');
      bloc.close();
    });

    test('reset returns to idle', () async {
      final bloc = ListeningBloc(
        repository: MockListeningRepository(grantPermission: true),
      );
      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      expect(bloc.state.status, ListeningStatus.listening);

      bloc.reset();
      await Future.delayed(Duration.zero);
      expect(bloc.state.status, ListeningStatus.idle);
      expect(bloc.state.verdictId, isNull);
      expect(bloc.state.errorMessage, isNull);
      bloc.close();
    });

    test('interruption began while listening transitions to error', () async {
      final beganController = StreamController<void>();
      final repo = MockListeningRepository(
        grantPermission: true,
        interruptionBegan: beganController.stream,
      );
      final bloc = ListeningBloc(repository: repo);
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      expect(bloc.state.status, ListeningStatus.listening);

      beganController.add(null);
      await Future.delayed(Duration.zero);

      expect(bloc.state.status, ListeningStatus.error);
      expect(bloc.state.errorMessage, isNotNull);
      expect(repo.stopRecordingCalled, isTrue);

      await beganController.close();
      bloc.close();
    });

    test('interruption ended restarts recording to listening', () async {
      final beganController = StreamController<void>();
      final endedController = StreamController<void>();
      final repo = MockListeningRepository(
        grantPermission: true,
        interruptionBegan: beganController.stream,
        interruptionEnded: endedController.stream,
      );
      final bloc = ListeningBloc(repository: repo);
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      expect(bloc.state.status, ListeningStatus.listening);

      beganController.add(null);
      await Future.delayed(Duration.zero);
      expect(bloc.state.status, ListeningStatus.error);

      endedController.add(null);
      await Future.delayed(Duration.zero);

      expect(bloc.state.status, ListeningStatus.listening);

      await beganController.close();
      await endedController.close();
      bloc.close();
    });

    test('full flow: start → verdict via SSE stream', () async {
      final controller = StreamController<Map<String, dynamic>>();
      final repo = MockListeningRepository(
        grantPermission: true,
        jobId: 'job-1',
        jobStream: controller.stream,
      );
      final bloc = ListeningBloc(repository: repo);
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);

      bloc.add(const StopListening());
      await Future.delayed(const Duration(milliseconds: 10));

      expect(states.any((s) => s.status == ListeningStatus.listening), isTrue);
      expect(states.any((s) => s.status == ListeningStatus.processing), isTrue);

      bloc.add(const SubmitTranscription('Test transcript'));
      await Future.delayed(const Duration(milliseconds: 10));

      controller.add({'type': 'completed', 'success': true, 'claims': [
        {'verdict': 'False', 'confidenceScore': 85, 'explanation': 'Test', 'assertion': 'Test claim'},
      ]});
      await Future.delayed(Duration.zero);

      expect(states.any((s) => s.status == ListeningStatus.verdictReady), isTrue);
      expect(states.lastWhere((s) => s.status == ListeningStatus.verdictReady).claimsData, isNotNull);

      await controller.close();
      bloc.close();
    });
  });
}
