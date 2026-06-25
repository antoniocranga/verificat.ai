import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/auth/auth_bloc.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verificat'),
        centerTitle: true,
        actions: [
          BlocBuilder<AuthBloc, AuthStatus>(
            builder: (context, authStatus) {
              if (authStatus == AuthStatus.authenticated) {
                return IconButton(
                  icon: const Icon(Icons.logout),
                  tooltip: 'Sign Out',
                  onPressed: () {
                    context.read<AuthBloc>().add(AuthSignOutRequested());
                    context.go('/login');
                  },
                );
              }
              return IconButton(
                icon: const Icon(Icons.login),
                tooltip: 'Sign In',
                onPressed: () => context.go('/login'),
              );
            },
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Verificat',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.4,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Verifică informațiile cu încredere',
                style: TextStyle(fontSize: 16, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              FilledButton(
                onPressed: () => context.go('/check/demo'),
                child: const Text('Vezi un exemplu'),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => context.go('/listen'),
                child: const Text('Verifică acum'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.go('/search'),
                child: const Text('Caută verificări'),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => context.go('/saved'),
                child: const Text('Verificări salvate'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
