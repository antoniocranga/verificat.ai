import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/core/widgets/widgets.dart';

void main() {
  group('AppFeatureCard', () {
    testWidgets('renders child widget', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: AppFeatureCard(child: Text('Hello'))),
      ));
      expect(find.text('Hello'), findsOneWidget);
    });
  });

  group('AppTextInput', () {
    testWidgets('renders hint text', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: AppTextInput(hintText: 'Enter text')),
      ));
      expect(find.text('Enter text'), findsOneWidget);
    });

    testWidgets('calls onChanged', (tester) async {
      String? value;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(body: AppTextInput(onChanged: (v) => value = v)),
      ));
      await tester.enterText(find.byType(TextField), 'test');
      expect(value, 'test');
    });
  });

  group('MonoEyebrow', () {
    testWidgets('uppercases label text', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: MonoEyebrow(label: 'Section Title')),
      ));
      expect(find.text('SECTION TITLE'), findsOneWidget);
      expect(find.text('Section Title'), findsNothing);
    });
  });
}
