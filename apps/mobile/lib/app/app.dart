import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/audio/audio_session_service.dart';
import '../core/auth/auth_bloc.dart';
import '../core/theme/app_theme.dart';
import '../features/consent/presentation/screens/consent_screen.dart';
import 'router.dart';

class VerificatApp extends StatefulWidget {
  final bool initialConsented;

  const VerificatApp({super.key, required this.initialConsented});

  @override
  State<VerificatApp> createState() => _VerificatAppState();
}

class _VerificatAppState extends State<VerificatApp> with WidgetsBindingObserver {
  late bool _consented;

  @override
  void initState() {
    super.initState();
    _consented = widget.initialConsented;
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _consented) {
      if (mounted) context.read<AuthBloc>().add(AuthSessionCheckRequested());
    }
  }

  void _acceptConsent() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('privacy-consent', true);
    if (mounted) setState(() => _consented = true);
    final sessionService = AudioSessionService();
    await sessionService.setCategoryPlayAndRecord();
    sessionService.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_consented) {
      return MaterialApp(
        title: 'Verificat',
        theme: appTheme,
        debugShowCheckedModeBanner: false,
        home: ConsentScreen(onAccept: _acceptConsent),
      );
    }

    return BlocProvider<AuthBloc>(
      create: (_) => AuthBloc()..add(AuthCheckRequested()),
      child: MaterialApp.router(
        title: 'Verificat',
        theme: appTheme,
        routerConfig: router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
