import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../core/auth/auth_bloc.dart';
import '../features/home/presentation/screens/home_screen.dart';
import '../features/check/presentation/screens/check_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/handoff/presentation/screens/handoff_screen.dart';
import '../features/listening/presentation/bloc/listening_bloc.dart';
import '../features/listening/presentation/screens/listening_screen.dart';

final router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final authStatus = context.read<AuthBloc>().state;
    final isLoginRoute = state.matchedLocation == '/login';
    final isProtected =
        state.matchedLocation.startsWith('/dashboard');

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
    GoRoute(
      path: '/',
      name: 'home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) {
        final error = state.uri.queryParameters['error'];
        return LoginScreen(error: error);
      },
    ),
    GoRoute(
      path: '/check/:id',
      name: 'check',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return CheckScreen(verdictId: id);
      },
    ),
    GoRoute(
      path: '/handoff/:token',
      name: 'handoff',
      builder: (context, state) {
        final token = state.pathParameters['token'] ?? '';
        return HandoffScreen(token: token);
      },
    ),
    GoRoute(
      path: '/listen',
      name: 'listen',
      builder: (context, state) => BlocProvider<ListeningBloc>(
        create: (_) => ListeningBloc(),
        child: const ListeningScreen(),
      ),
    ),
  ],
);
