import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/core/auth/auth_bloc.dart';
import 'package:verificat_mobile/features/settings/presentation/screens/settings_screen.dart';

void main() {
  testWidgets('settings screen shows account and about sections', (tester) async {
    await tester.pumpWidget(
      BlocProvider<AuthBloc>(
        create: (_) => AuthBloc(),
        child: const MaterialApp(home: SettingsScreen()),
      ),
    );
    await tester.pump();

    expect(find.text('Setări'), findsOneWidget);
    expect(find.text('Cont'), findsOneWidget);
    expect(find.text('Despre'), findsOneWidget);
    expect(find.text('Versiune'), findsOneWidget);
    expect(find.text('1.0.0'), findsOneWidget);
  });
}
