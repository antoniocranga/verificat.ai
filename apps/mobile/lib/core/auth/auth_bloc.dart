import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthBloc extends Bloc<AuthEvent, AuthStatus> {
  AuthBloc() : super(AuthStatus.unknown) {
    on<AuthCheckRequested>(_onCheckRequested);
    on<AuthSignOutRequested>(_onSignOutRequested);
    on<AuthSessionCheckRequested>(_onSessionCheckRequested);
    _initListener();
  }

  void _initListener() {
    try {
      Supabase.instance.client.auth.onAuthStateChange.listen((authState) {
        // ignore: invalid_use_of_visible_for_testing_member
        emit(authState.session != null ? AuthStatus.authenticated : AuthStatus.unauthenticated);
      });
    } catch (_) {
      // Supabase not initialized (e.g., in tests)
    }
  }

  void _onCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthStatus> emit,
  ) {
    try {
      final session = Supabase.instance.client.auth.currentSession;
      emit(session != null
          ? AuthStatus.authenticated
          : AuthStatus.unauthenticated);
    } catch (_) {
      emit(AuthStatus.unauthenticated);
    }
  }

  void _onSignOutRequested(
    AuthSignOutRequested event,
    Emitter<AuthStatus> emit,
  ) {
    try {
      Supabase.instance.client.auth.signOut();
      emit(AuthStatus.unauthenticated);
    } catch (_) {
      // Supabase not initialized
    }
  }

  void _onSessionCheckRequested(
    AuthSessionCheckRequested event,
    Emitter<AuthStatus> emit,
  ) {
    try {
      final session = Supabase.instance.client.auth.currentSession;
      if (session == null) {
        emit(AuthStatus.unauthenticated);
      }
    } catch (_) {
      emit(AuthStatus.unauthenticated);
    }
  }
}

class AuthCheckRequested extends AuthEvent {}
class AuthSignOutRequested extends AuthEvent {}
class AuthSessionCheckRequested extends AuthEvent {}

abstract class AuthEvent {}
