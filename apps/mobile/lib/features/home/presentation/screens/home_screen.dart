import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/auth/auth_bloc.dart';
import '../../../../core/widgets/widgets.dart';

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
              Icon(
                Icons.verified_outlined,
                size: 64,
                color: Theme.of(context).colorScheme.onSurface,
              ),
              const SizedBox(height: 16),
              Text(
                'Verificat',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Verifică informațiile cu încredere',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: const Color(0xFF8F8F8F),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: AppPrimaryButton(
                  label: 'Verifică acum',
                  onPressed: () => context.go('/listen'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: AppGhostButton(
                  label: 'Caută verificări',
                  onPressed: () => context.go('/search'),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: AppSecondaryButton(
                  label: 'Vezi un exemplu',
                  onPressed: () => context.go('/check/e2e00000-0000-0000-0000-000000000003'),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: AppSecondaryButton(
                  label: 'Verificări salvate',
                  onPressed: () => context.go('/saved'),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: AppSecondaryButton(
                  label: 'Setări',
                  onPressed: () => context.go('/settings'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
