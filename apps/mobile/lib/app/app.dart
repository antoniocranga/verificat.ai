import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/audio/audio_session_service.dart';
import '../core/theme/app_theme.dart';
import '../features/consent/presentation/screens/consent_screen.dart';
import '../features/onboarding/presentation/screens/onboarding_screen.dart';
import 'router.dart';

ThemeMode _themeModeFromPref(String value) {
  switch (value) {
    case 'light':
      return ThemeMode.light;
    case 'dark':
      return ThemeMode.dark;
    default:
      return ThemeMode.system;
  }
}

String _themeModeToPref(ThemeMode mode) {
  switch (mode) {
    case ThemeMode.light:
      return 'light';
    case ThemeMode.dark:
      return 'dark';
    default:
      return 'system';
  }
}

class VerificatApp extends StatefulWidget {
  final bool initialConsented;

  const VerificatApp({super.key, required this.initialConsented});

  @override
  State<VerificatApp> createState() => _VerificatAppState();
}

class _VerificatAppState extends State<VerificatApp>
    with WidgetsBindingObserver {
  late bool _consented;
  bool? _onboardingComplete;
  ThemeMode _themeMode = ThemeMode.system;

  @override
  void initState() {
    super.initState();
    _consented = widget.initialConsented;
    WidgetsBinding.instance.addObserver(this);
    if (_consented) {
      _checkOnboarding();
      _loadTheme();
    }
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.getString('theme_mode') ?? 'system';
    if (mounted) {
      setState(() {
        _themeMode = _themeModeFromPref(value);
      });
    }
  }

  Future<void> _checkOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    final complete = prefs.getBool('onboarding-complete') ?? false;
    if (mounted) setState(() => _onboardingComplete = complete);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {}

  Future<void> _acceptConsent() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('privacy-consent', true);
    final onboarded = prefs.getBool('onboarding-complete') ?? false;
    if (mounted) {
      setState(() {
        _consented = true;
        _onboardingComplete = onboarded;
      });
    }
    final sessionService = AudioSessionService();
    await sessionService.setCategoryPlayAndRecord();
    sessionService.dispose();
  }

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding-complete', true);
    if (mounted) setState(() => _onboardingComplete = true);
  }

  void _changeTheme(ThemeMode mode) {
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString('theme_mode', _themeModeToPref(mode));
    });
    if (mounted) setState(() => _themeMode = mode);
  }

  @override
  Widget build(BuildContext context) {
    if (!_consented) {
      return MaterialApp(
        title: 'VerificatAI',
        theme: appThemeLight,
        darkTheme: appThemeDark,
        themeMode: ThemeMode.system,
        debugShowCheckedModeBanner: false,
        home: ConsentScreen(onAccept: _acceptConsent),
      );
    }

    if (_onboardingComplete == false) {
      return MaterialApp(
        title: 'VerificatAI',
        theme: appThemeLight,
        darkTheme: appThemeDark,
        themeMode: ThemeMode.system,
        debugShowCheckedModeBanner: false,
        home: OnboardingScreen(onComplete: _completeOnboarding),
      );
    }

    return AppThemeProvider(
      themeMode: _themeMode,
      onThemeChanged: _changeTheme,
      child: MaterialApp.router(
        title: 'VerificatAI',
        theme: appThemeLight,
        darkTheme: appThemeDark,
        themeMode: _themeMode,
        routerConfig: router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class AppThemeProvider extends InheritedWidget {
  final ThemeMode themeMode;
  final ValueChanged<ThemeMode> onThemeChanged;

  const AppThemeProvider({
    super.key,
    required this.themeMode,
    required this.onThemeChanged,
    required super.child,
  });

  static AppThemeProvider of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppThemeProvider>()!;
  }

  @override
  bool updateShouldNotify(AppThemeProvider oldWidget) =>
      themeMode != oldWidget.themeMode;
}
