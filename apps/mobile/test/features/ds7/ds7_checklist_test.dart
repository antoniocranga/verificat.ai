import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/core/widgets/widgets.dart';

void main() {
  group('DS.7 Checklist', () {
    testWidgets('AppFeatureCard is rendered', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: AppFeatureCard(child: Text('test'))),
      ));
      expect(find.text('test'), findsOneWidget);
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
