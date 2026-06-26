import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/auth/auth_bloc.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text('Verificat'),
        centerTitle: true,
        actions: [
          BlocBuilder<AuthBloc, AuthStatus>(
            builder: (context, authStatus) {
              if (authStatus == AuthStatus.authenticated) {
                return IconButton(
                  icon: const Icon(Icons.logout_rounded),
                  tooltip: 'Deconectare',
                  onPressed: () {
                    context.read<AuthBloc>().add(AuthSignOutRequested());
                    context.go('/login');
                  },
                );
              }
              return IconButton(
                icon: const Icon(Icons.login_rounded),
                tooltip: 'Autentificare',
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
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.subtle.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(
                  Icons.verified_outlined,
                  size: 40,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Verificat',
                style: AppTextStyles.headingSection,
              ),
              const SizedBox(height: 8),
              Text(
                'Verifică informațiile cu încredere',
                style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 36),
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  label: 'Verifică acum',
                  variant: AppButtonVariant.accent,
                  width: double.infinity,
                  onPressed: () => context.go('/listen'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: AppButton.secondary(
                  label: 'Caută verificări',
                  width: double.infinity,
                  onPressed: () => context.go('/search'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: AppButton.ghost(
                  label: 'Vezi un exemplu',
                  width: double.infinity,
                  onPressed: () => context.go('/check/e2e00000-0000-0000-0000-000000000003'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: AppButton.ghost(
                  label: 'Verificări salvate',
                  width: double.infinity,
                  onPressed: () => context.go('/saved'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: AppButton.ghost(
                  label: 'Setări',
                  width: double.infinity,
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
