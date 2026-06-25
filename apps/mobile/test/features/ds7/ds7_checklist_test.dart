import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/features/listening/domain/repositories/listening_repository.dart';
import 'package:verificat_mobile/features/listening/presentation/bloc/listening_bloc.dart';
import 'package:verificat_mobile/features/listening/presentation/screens/listening_screen.dart';
import 'package:verificat_mobile/core/widgets/widgets.dart';

class _MockListeningRepo implements ListeningRepository {
  @override Future<bool> requestMicPermission() async => true;
  @override Future<String> startRecording() async => '/tmp/a.aac';
  @override Future<void> stopRecording() async {}
  @override Future<String?> uploadAndVerify() async => null;
  @override Stream<Map<String, dynamic>> streamJobEvents(String jobId) => const Stream.empty();
  @override Stream<void> get onInterruptionBegan => const Stream.empty();
  @override Stream<void> get onInterruptionEnded => const Stream.empty();
}

void main() {
  group('DS.7 Checklist', () {
    testWidgets('ListeningScreen uses AppSmallPrimaryButton not AppPrimaryButton', (tester) async {
      final bloc = ListeningBloc(repository: _MockListeningRepo());
      await tester.pumpWidget(MaterialApp(
        home: BlocProvider<ListeningBloc>.value(
          value: bloc,
          child: const ListeningScreen(),
        ),
      ));

      expect(find.byType(AppSmallPrimaryButton), findsOneWidget);
      expect(find.byType(AppPrimaryButton), findsNothing);
      expect(find.byType(AppSecondaryButton), findsNothing);
      bloc.close();
    });

    testWidgets('AppFeatureCard has no elevation shadow', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: AppFeatureCard(child: Text('test'))),
      ));
      final container = tester.widget<Container>(find.byType(Container));
      final decoration = container.decoration as BoxDecoration?;
      expect(decoration?.boxShadow, isNull);
    });

    testWidgets('MonoEyebrow uppercases text', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: MonoEyebrow(label: 'Test Label')),
      ));
      expect(find.text('TEST LABEL'), findsOneWidget);
      expect(find.text('Test Label'), findsNothing);
    });
  });
}
