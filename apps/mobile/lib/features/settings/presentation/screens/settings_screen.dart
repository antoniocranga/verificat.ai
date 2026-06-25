import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/auth/auth_bloc.dart';
import '../../../../core/widgets/widgets.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setări')),
      body: ListView(
        children: [
          const SizedBox(height: 16),
          _sectionHeader(context, 'Cont'),
          _settingsRow(context, 'Autentificare',
            trailing: BlocBuilder<AuthBloc, AuthStatus>(
              builder: (context, authStatus) {
                if (authStatus == AuthStatus.authenticated) {
                  return AppSmallPrimaryButton(
                    label: 'Deconectare',
                    foregroundColor: const Color(0xFFEE0000),
                    onPressed: () {
                      context.read<AuthBloc>().add(AuthSignOutRequested());
                      context.go('/login');
                    },
                  );
                }
                return AppSmallPrimaryButton(
                  label: 'Autentificare',
                  onPressed: () => context.go('/login'),
                );
              },
            ),
          ),
          const Divider(height: 1, color: Color(0xFFEBEBEB)),
          _settingsRow(context, 'Ștergeți contul',
            trailing: AppSmallPrimaryButton(
              label: 'Ștergeți',
              foregroundColor: const Color(0xFFEE0000),
              onPressed: () {},
            ),
          ),
          const SizedBox(height: 24),
          _sectionHeader(context, 'Despre'),
          _settingsRow(context, 'Versiune', subtitle: '1.0.0'),
          const Divider(height: 1, color: Color(0xFFEBEBEB)),
          _settingsRow(context, 'Termeni și condiții'),
          const Divider(height: 1, color: Color(0xFFEBEBEB)),
          _settingsRow(context, 'Politica de confidențialitate'),
        ],
      ),
    );
  }

  Widget _sectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(color: const Color(0xFF8F8F8F)),
      ),
    );
  }

  Widget _settingsRow(BuildContext context, String title, {String? subtitle, Widget? trailing}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.bodyMedium),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(subtitle, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: const Color(0xFF8F8F8F))),
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
