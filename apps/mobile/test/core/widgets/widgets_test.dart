import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/core/widgets/widgets.dart';

void main() {
  group('AppPrimaryButton', () {
    testWidgets('has StadiumBorder shape', (tester) async {
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(body: AppPrimaryButton(label: 'Start', onPressed: () {})),
      ));
      final button = tester.widget<ElevatedButton>(find.byType(ElevatedButton));
      final style = button.style!;
      final shape = style.shape!.resolve({});
      expect(shape, isA<StadiumBorder>());
    });
  });

  group('AppSecondaryButton', () {
    testWidgets('has StadiumBorder shape', (tester) async {
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(body: AppSecondaryButton(label: 'Skip', onPressed: () {})),
      ));
      final button = tester.widget<ElevatedButton>(find.byType(ElevatedButton));
      final style = button.style!;
      final shape = style.shape!.resolve({});
      expect(shape, isA<StadiumBorder>());
    });
  });

  group('AppSmallPrimaryButton', () {
    testWidgets('has BorderRadius.circular(6) shape', (tester) async {
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(body: AppSmallPrimaryButton(label: 'Save', onPressed: () {})),
      ));
      final button = tester.widget<ElevatedButton>(find.byType(ElevatedButton));
      final style = button.style!;
      final shape = style.shape!.resolve({}) as RoundedRectangleBorder;
      expect(shape.borderRadius, BorderRadius.circular(6));
    });
  });

  group('AppGhostButton', () {
    testWidgets('has BorderRadius.circular(6) shape', (tester) async {
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(body: AppGhostButton(label: 'Cancel', onPressed: () {})),
      ));
      final button = tester.widget<OutlinedButton>(find.byType(OutlinedButton));
      final style = button.style!;
      final shape = style.shape!.resolve({}) as RoundedRectangleBorder;
      expect(shape.borderRadius, BorderRadius.circular(6));
    });

    testWidgets('fires onPressed', (tester) async {
      bool tapped = false;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(body: AppGhostButton(label: 'Tap', onPressed: () => tapped = true)),
      ));
      await tester.tap(find.text('Tap'));
      expect(tapped, isTrue);
    });
  });

  group('AppFeatureCard', () {
    testWidgets('renders child widget', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: AppFeatureCard(child: Text('Hello'))),
      ));
      expect(find.text('Hello'), findsOneWidget);
    });

    testWidgets('has white background and 12px border radius', (tester) async {
      await tester.pumpWidget(const MaterialApp(
        home: Scaffold(body: AppFeatureCard(child: SizedBox())),
      ));
      final container = tester.widget<Container>(find.byType(Container));
      final decoration = container.decoration! as BoxDecoration;
      expect(decoration.color, const Color(0xFFFFFFFF));
      expect((decoration.borderRadius! as BorderRadius).topLeft.x, 12);
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
