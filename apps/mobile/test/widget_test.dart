import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:verificat_mobile/app/app.dart';
import 'package:verificat_mobile/core/presentation/widgets/brand_text.dart';

void main() {
  testWidgets('Shows consent screen on first launch',
      (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const VerificatApp(initialConsented: false));
    await tester.pumpAndSettle();

    expect(find.text('CONFIDENȚIALITATEA DATELOR'), findsOneWidget);
    expect(find.text('Am înțeles. Continuați'), findsOneWidget);
  });

  testWidgets('Consent acceptance transitions to onboarding',
      (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const VerificatApp(initialConsented: false));
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('Am înțeles. Continuați'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Am înțeles. Continuați'));
    await tester.pumpAndSettle();

    expect(find.text('CONFIDENȚIALITATEA DATELOR'), findsNothing);
    expect(find.text('Verifică informațiile\ncu încredere'), findsOneWidget);
  });

  testWidgets('App renders home screen when consented and onboarded',
      (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({'onboarding-complete': true});
    await tester.pumpWidget(const VerificatApp(initialConsented: true));
    await tester.pumpAndSettle();

    expect(find.byType(BrandText), findsWidgets);
    expect(find.text('Verifică acum'), findsOneWidget);
  });

  testWidgets('Navigation to check screen works', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({'onboarding-complete': true});
    await tester.pumpWidget(const VerificatApp(initialConsented: true));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Verifică acum'));
    await tester.pumpAndSettle();

    expect(find.text('Verificare Audio'), findsOneWidget);
  });
}
