import 'dart:async';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:record/record.dart';
import 'package:uuid/uuid.dart';
import 'package:verificat_mobile/features/listening/data/services/transcript_stream_service.dart';
import 'package:verificat_mobile/features/listening/domain/repositories/listening_repository.dart';
import 'package:verificat_mobile/features/listening/presentation/bloc/listening_bloc.dart';
import 'package:verificat_mobile/features/listening/presentation/screens/listening_screen.dart';

class _FakeAudioRecorder extends AudioRecorder {
  @override
  Future<bool> hasPermission({bool request = true}) async => true;
  @override
  Future<Stream<Uint8List>> startStream(RecordConfig config) async => const Stream.empty();
  @override
  Future<String?> stop() async => null;
  @override
  Future<void> dispose() async {}
}

TranscriptStreamService _fakeStreaming() => TranscriptStreamService(
  recorder: _FakeAudioRecorder(),
  uuid: const Uuid(),
);

class MockRepository implements ListeningRepository {
  final TranscriptStreamService _streamingService;
  MockRepository({TranscriptStreamService? streamingService}) : _streamingService = streamingService ?? _fakeStreaming();

  @override
  Future<bool> requestMicPermission() async => true;

  @override
  Future<String> startRecording() async => '/tmp/test.aac';

  @override
  Future<void> stopRecording() async {}

  @override
  Future<String?> uploadAndVerify() async => null;

  @override
  Stream<Map<String, dynamic>> streamJobEvents(String jobId) {
    return const Stream.empty();
  }

  @override
  Stream<void> get onInterruptionBegan => const Stream.empty();

  @override
  Stream<void> get onInterruptionEnded => const Stream.empty();

  @override
  Stream<dynamic> onAmplitude() => const Stream.empty();

  @override
  Future<String?> transcribeAudio() async => 'Test transcript';

  @override
  Future<Map<String, dynamic>> verifyText(String text) async => {};

  @override
  Future<void> startStreaming() async {}

  @override
  Future<void> stopStreaming() async {}

  @override
  TranscriptStreamService get streamingService => _streamingService;
}

Widget createTestWidget(ListeningBloc bloc) {
  return MaterialApp(
    home: BlocProvider<ListeningBloc>.value(
      value: bloc,
      child: const ListeningScreen(),
    ),
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(const MethodChannel('com.llfbandit.record/messages'),
          (MethodCall call) async => null);

  group('ListeningScreen', () {
    testWidgets('renders idle state with start button', (tester) async {
      final bloc = ListeningBloc(repository: MockRepository());
      await tester.pumpWidget(createTestWidget(bloc));

      expect(find.text('Pregătit pentru verificare'), findsOneWidget);
      expect(find.text('Înregistrare Audio'), findsOneWidget);
      expect(find.text('Flux în Timp Real'), findsOneWidget);
      bloc.close();
    });

    testWidgets('renders listening state with stop button', (tester) async {
      final bloc = ListeningBloc(repository: MockRepository());
      bloc.emit(const ListeningState(
        status: ListeningStatus.listening,
        elapsedSeconds: 0,
      ));
      await tester.pumpWidget(createTestWidget(bloc));

      expect(find.text('Se înregistrează...'), findsOneWidget);
      expect(find.text('Oprește'), findsOneWidget);
      bloc.close();
    });

    testWidgets('renders processing state', (tester) async {
      final bloc = ListeningBloc(repository: MockRepository());
      bloc.emit(const ListeningState(
        status: ListeningStatus.processing,
        elapsedSeconds: 0,
      ));
      await tester.pumpWidget(createTestWidget(bloc));

      expect(find.text('Se procesează...'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsWidgets);
      bloc.close();
    });

    testWidgets('renders verdict ready state', (tester) async {
      final bloc = ListeningBloc(repository: MockRepository());
      bloc.emit(const ListeningState(
        status: ListeningStatus.verdictReady,
        elapsedSeconds: 0,
        claimsData: [
          {'verdict': 'True', 'confidenceScore': 95, 'explanation': 'Corect', 'assertion': 'Test'},
        ],
      ));
      await tester.pumpWidget(createTestWidget(bloc));

      expect(find.text('Rezultatul este gata!'), findsOneWidget);
      expect(find.text('Verifică din nou'), findsOneWidget);
      expect(find.byIcon(Icons.check_rounded), findsOneWidget);
      bloc.close();
    });

    testWidgets('renders error state with message', (tester) async {
      final bloc = ListeningBloc(repository: MockRepository());
      bloc.emit(const ListeningState(
        status: ListeningStatus.error,
        elapsedSeconds: 0,
        errorMessage: 'Permisiunea pentru microfon a fost refuzată.',
      ));
      await tester.pumpWidget(createTestWidget(bloc));

      expect(find.text('A apărut o eroare'), findsOneWidget);
      expect(find.text('Permisiunea pentru microfon a fost refuzată.'),
          findsOneWidget);
      expect(find.text('Încearcă din Nou'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline_rounded), findsOneWidget);
      bloc.close();
    });
  });
}
