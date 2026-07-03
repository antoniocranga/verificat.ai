import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/app/app.dart';
import 'package:verificat_mobile/features/settings/presentation/screens/settings_screen.dart';

void main() {
  testWidgets('settings screen shows sections', (tester) async {
    await tester.pumpWidget(
      AppThemeProvider(
        themeMode: ThemeMode.system,
        onThemeChanged: (_) {},
        child: const MaterialApp(home: SettingsScreen()),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Setări'), findsOneWidget);
    expect(find.text('ASCULTARE'), findsOneWidget);
    expect(find.text('DATE'), findsOneWidget);
  });
}
