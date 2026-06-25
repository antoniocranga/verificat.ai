import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:verificat_mobile/app/app.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('Shows consent screen on first launch', (WidgetTester tester) async {
    await tester.pumpWidget(const VerificatApp(initialConsented: false));
    await tester.pumpAndSettle();

    expect(find.text('Confidențialitatea datelor'), findsOneWidget);
    expect(find.text('Am înțeles. Continuați'), findsOneWidget);
  });

  testWidgets('Consent acceptance transitions to main app', (WidgetTester tester) async {
    await tester.pumpWidget(const VerificatApp(initialConsented: false));
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('Am înțeles. Continuați'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Am înțeles. Continuați'));
    await tester.pumpAndSettle();

    expect(find.text('Confidențialitatea datelor'), findsNothing);
    expect(find.text('Vezi un exemplu'), findsOneWidget);
  });

  testWidgets('App renders home screen when consented', (WidgetTester tester) async {
    await tester.pumpWidget(const VerificatApp(initialConsented: true));
    await tester.pumpAndSettle();

    expect(find.text('Verificat'), findsWidgets);
    expect(find.text('Vezi un exemplu'), findsOneWidget);
  });

  testWidgets('Navigation to check screen works', (WidgetTester tester) async {
    await tester.pumpWidget(const VerificatApp(initialConsented: true));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Vezi un exemplu'));
    await tester.pumpAndSettle();

    expect(find.text('Rezultat Verificare'), findsOneWidget);
  });
}
