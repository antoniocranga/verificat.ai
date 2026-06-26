import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/auth/auth_bloc.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        leading: const BackButton(),
        title: const Text('Setări'),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 8),

          // Cont section
          _sectionHeader('Cont'),
          AppSurface(
            elevation: AppSurfaceElevation.raised,
            borderRadius: 12,
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _settingsRow(
                  context,
                  'Autentificare',
                  trailing: BlocBuilder<AuthBloc, AuthStatus>(
                    builder: (context, authStatus) {
                      if (authStatus == AuthStatus.authenticated) {
                        return AppButton.destructive(
                          label: 'Deconectare',
                          size: AppButtonSize.sm,
                          onPressed: () {
                            context
                                .read<AuthBloc>()
                                .add(AuthSignOutRequested());
                            context.go('/login');
                          },
                        );
                      }
                      return AppButton(
                        label: 'Autentificare',
                        size: AppButtonSize.sm,
                        onPressed: () => context.go('/login'),
                      );
                    },
                  ),
                ),
                const Divider(height: 1, color: AppColors.subtle),
                _settingsRow(
                  context,
                  'Ștergeți contul',
                  trailing: AppButton.destructive(
                    label: 'Ștergeți',
                    size: AppButtonSize.sm,
                    onPressed: () {},
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Despre section
          _sectionHeader('Despre'),
          AppSurface(
            elevation: AppSurfaceElevation.raised,
            borderRadius: 12,
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _settingsRow(context, 'Versiune', subtitle: '1.0.0'),
                const Divider(height: 1, color: AppColors.subtle),
                _settingsRow(context, 'Termeni și condiții'),
                const Divider(height: 1, color: AppColors.subtle),
                _settingsRow(context, 'Politica de confidențialitate'),
              ],
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
      child: Text(title.toUpperCase(), style: AppTextStyles.labelCaps),
    );
  }

  Widget _settingsRow(
    BuildContext context,
    String title, {
    String? subtitle,
    Widget? trailing,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.labelLg.copyWith(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                )),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: AppTextStyles.labelMd.copyWith(
                      color: AppColors.mid,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }
}
