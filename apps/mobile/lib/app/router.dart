import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../core/auth/auth_bloc.dart';
import '../core/widgets/main_shell.dart';

import '../features/home/presentation/screens/home_screen.dart';
import '../features/check/presentation/screens/check_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/handoff/presentation/screens/handoff_screen.dart';
import '../features/listening/presentation/bloc/listening_bloc.dart';
import '../features/listening/presentation/screens/listening_screen.dart';
import '../features/search/presentation/bloc/search_bloc.dart';
import '../features/search/presentation/screens/search_screen.dart';
import '../features/history/presentation/bloc/saved_checks_bloc.dart';
import '../features/history/presentation/screens/history_screen.dart';
import '../features/settings/presentation/screens/settings_screen.dart';
import 'transitions.dart';

final router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final authStatus = context.read<AuthBloc>().state;
    final isLoginRoute = state.matchedLocation == '/login';
    final isProtected = state.matchedLocation.startsWith('/dashboard');

    if (authStatus == AuthStatus.unknown) return null;

    if (authStatus == AuthStatus.unauthenticated && isProtected) {
      return '/login';
    }

    if (authStatus == AuthStatus.authenticated && isLoginRoute) {
      return '/';
    }

    return null;
  },
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
          path: '/search',
          name: 'search',
          pageBuilder: (context, state) => buildPage(
            BlocProvider<SearchBloc>(
              create: (_) => SearchBloc(),
              child: const SearchScreen(),
            ),
            state,
          ),
        ),
        GoRoute(
          path: '/saved',
          name: 'saved',
          pageBuilder: (context, state) => buildPage(
            BlocProvider<SavedChecksBloc>(
              create: (_) =>
                  SavedChecksBloc()..add(const SavedChecksLoaded()),
              child: const HistoryScreen(),
            ),
            state,
          ),
        ),
      ],
    ),
    GoRoute(
      path: '/login',
      name: 'login',
      pageBuilder: (context, state) {
        final error = state.uri.queryParameters['error'];
        return buildPage(LoginScreen(error: error), state);
      },
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
    GoRoute(
      path: '/settings',
      name: 'settings',
      pageBuilder: (context, state) =>
          buildPage(const SettingsScreen(), state),
    ),
  ],
);
