import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../core/widgets/main_shell.dart';

import '../features/home/presentation/screens/home_screen.dart';
import '../features/check/presentation/screens/check_screen.dart';
import '../features/handoff/presentation/screens/handoff_screen.dart';
import '../features/listening/presentation/bloc/listening_bloc.dart';
import '../features/listening/presentation/screens/listening_screen.dart';
import '../features/settings/presentation/screens/settings_screen.dart';
import '../features/history/presentation/screens/history_screen.dart';
import '../features/history/presentation/bloc/saved_checks_bloc.dart';
import 'transitions.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return MainShell(child: child);
      },
      routes: [
        GoRoute(
          path: '/',
          name: 'home',
          pageBuilder: (context, state) =>
              buildPage(const HomeScreen(), state),
        ),
        GoRoute(
          path: '/listen',
          name: 'listen',
          pageBuilder: (context, state) => buildPage(
            BlocProvider<ListeningBloc>(
              create: (_) => ListeningBloc(),
              child: const ListeningScreen(),
            ),
            state,
          ),
        ),
        GoRoute(
          path: '/settings',
          name: 'settings',
          pageBuilder: (context, state) =>
              buildPage(const SettingsScreen(), state),
        ),
        GoRoute(
          path: '/history',
          name: 'history',
          pageBuilder: (context, state) => buildPage(
            BlocProvider<SavedChecksBloc>(
              create: (_) => SavedChecksBloc()..add(const SavedChecksLoaded()),
              child: const HistoryScreen(),
            ),
            state,
          ),
        ),
      ],
    ),
    GoRoute(
      path: '/check/:id',
      name: 'check',
      pageBuilder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return buildPage(CheckScreen(verdictId: id), state);
      },
    ),
    GoRoute(
      path: '/handoff/:token',
      name: 'handoff',
      pageBuilder: (context, state) {
        final token = state.pathParameters['token'] ?? '';
        return buildPage(HandoffScreen(token: token), state);
      },
    ),
  ],
);
