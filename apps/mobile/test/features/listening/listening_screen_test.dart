import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/features/listening/data/services/transcript_stream_service.dart';
import 'package:verificat_mobile/features/listening/domain/repositories/listening_repository.dart';
import 'package:verificat_mobile/features/listening/domain/entities/transcript_segment.dart';
import 'package:verificat_mobile/features/listening/presentation/bloc/listening_bloc.dart';
import 'package:verificat_mobile/features/listening/presentation/screens/listening_screen.dart';

class MockRepository implements ListeningRepository {
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
  Stream<String> get onStreamError => const Stream.empty();

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
  TranscriptStreamService? get streamingService => null;
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
  group('ListeningScreen', () {
    testWidgets('renders idle state with mode selector', (tester) async {
      final bloc = ListeningBloc(repository: MockRepository());
      await tester.pumpWidget(createTestWidget(bloc));

      expect(find.text('Mod'), findsOneWidget);
      expect(find.text('Timp real'), findsOneWidget);
      bloc.close();
    });

    testWidgets('renders listening state', (tester) async {
      final bloc = ListeningBloc(repository: MockRepository());
      bloc.emit(const ListeningState(
        status: ListeningStatus.listening,
        elapsedSeconds: 0,
      ));
      await tester.pumpWidget(createTestWidget(bloc));

      expect(find.text('Se înregistrează...'), findsOneWidget);
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
      expect(find.text('Audio se analizează. Se verifică afirmațiile.'), findsOneWidget);
      bloc.close();
    });

    testWidgets('renders verdict ready state', (tester) async {
      final bloc = ListeningBloc(repository: MockRepository());
      bloc.emit(const ListeningState(
        status: ListeningStatus.verdictReady,
        elapsedSeconds: 0,
        segments: [
          TranscriptSegment(
            segmentId: 'test-1',
            text: 'A claim to check',
            verdict: StreamingVerdict.verdadero,
            confidence: 0.95,
            explanation: 'Corect',
          ),
        ],
      ));
      await tester.pumpWidget(createTestWidget(bloc));

      expect(find.text('Rezumat sesiune'), findsOneWidget);
      expect(find.text('Verifică din nou'), findsOneWidget);
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
