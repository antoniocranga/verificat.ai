import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/auth/auth_bloc.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/brand_text.dart';
import 'package:flutter_svg/flutter_svg.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        leading: null,
        actions: [
          BlocBuilder<AuthBloc, AuthStatus>(
            builder: (context, authStatus) {
              if (authStatus == AuthStatus.authenticated) {
                return IconButton(
                  icon: const Icon(Icons.logout_rounded),
                  tooltip: 'Deconectare',
                  onPressed: () {
                    context.read<AuthBloc>().add(AuthSignOutRequested());
                    context.push('/login');
                  },
                );
              }
              return IconButton(
                icon: const Icon(Icons.login_rounded),
                tooltip: 'Autentificare',
                onPressed: () => context.push('/login'),
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
                child: Center(
                  child: SvgPicture.asset(
                    'assets/images/logo-accent.svg',
                    width: 40,
                    height: 40,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const BrandText(
                'verificat.xyz',
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
                  onPressed: () => context.push('/listen'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: AppButton.secondary(
                  label: 'Caută verificări',
                  width: double.infinity,
                  onPressed: () => context.push('/search'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: AppButton.ghost(
                  label: 'Vezi un exemplu',
                  width: double.infinity,
                  onPressed: () => context
                      .push('/check/e2e00000-0000-0000-0000-000000000003'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: AppButton.ghost(
                  label: 'Verificări salvate',
                  width: double.infinity,
                  onPressed: () => context.push('/saved'),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: AppButton.ghost(
                  label: 'Setări',
                  width: double.infinity,
                  onPressed: () => context.push('/settings'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
