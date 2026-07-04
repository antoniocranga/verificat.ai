import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../app/app.dart';
import '../../../../core/env/env.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../history/data/repositories/saved_checks_repository_impl.dart';
import '../../../listening/presentation/bloc/listening_bloc.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = AppThemeProvider.of(context);
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        title: const Text('Setări'),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 8),
          _sectionHeader(context, 'Aspect'),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: AppSurface(
              elevation: AppSurfaceElevation.raised,
              borderRadius: 12,
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  SelectorTrigger<ThemeMode>(
                    title: 'Tema',
                    currentValue: themeProvider.themeMode,
                    options: const [
                      SelectorOption(
                          value: ThemeMode.light,
                          label: 'Luminoasă',
                          icon: Icons.light_mode_rounded),
                      SelectorOption(
                          value: ThemeMode.dark,
                          label: 'Întunecată',
                          icon: Icons.dark_mode_rounded),
                      SelectorOption(
                          value: ThemeMode.system,
                          label: 'Sistem',
                          icon: Icons.settings_rounded),
                    ],
                    onChanged: (mode) => themeProvider.onThemeChanged(mode),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          _sectionHeader(context, 'Ascultare'),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: AppSurface(
              elevation: AppSurfaceElevation.raised,
              borderRadius: 12,
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _defaultModeTile(context),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          _sectionHeader(context, 'Date'),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: AppSurface(
              elevation: AppSurfaceElevation.raised,
              borderRadius: 12,
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _micPermissionInfoTile(context),
                  if (!Platform.isMacOS) const Divider(height: 1),
                  if (!Platform.isMacOS) _micPermissionTile(context),
                  const Divider(height: 1),
                  _clearHistoryTile(context),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          _sectionHeader(context, 'Despre'),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: AppSurface(
              elevation: AppSurfaceElevation.raised,
              borderRadius: 12,
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _settingsRow(context, title: 'Versiune', subtitle: '1.0.0'),
                  const Divider(height: 1),
                  _linkTile(context, 'Termeni și condiții', AppEnv.termsUrl),
                  const Divider(height: 1),
                  _linkTile(context, 'Politica de confidențialitate',
                      AppEnv.privacyUrl),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Color _fg(BuildContext context) => Theme.of(context).colorScheme.onSurface;
  Color _mid(BuildContext context) =>
      Theme.of(context).colorScheme.onSurfaceVariant;

  Widget _defaultModeTile(BuildContext context) {
    return FutureBuilder<String?>(
      future: SharedPreferences.getInstance()
          .then((p) => p.getString('default-listen-mode')),
      builder: (context, snapshot) {
        final savedMode = snapshot.data == 'recording'
            ? ListenMode.recording
            : ListenMode.streaming;
        return SelectorTrigger<ListenMode>(
          title: 'Mod implicit',
          currentValue: savedMode,
          options: const [
            SelectorOption(
              value: ListenMode.streaming,
              label: 'Timp real',
              icon: Icons.wifi_rounded,
              subtitle: 'Verificare în timp ce vorbești',
            ),
            SelectorOption(
              value: ListenMode.recording,
              label: 'Înregistrare',
              icon: Icons.radio_button_checked_rounded,
              subtitle: 'Înregistrează și trimite',
            ),
          ],
          onChanged: (mode) async {
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('default-listen-mode',
                mode == ListenMode.streaming ? 'streaming' : 'recording');
          },
        );
      },
    );
  }

  Widget _micPermissionInfoTile(BuildContext context) {
    return _TappableRow(
      icon: Icons.mic_rounded,
      title: 'Permisiuni microfon',
      subtitle: 'Atinge pentru detalii',
      onTap: () {
        HapticFeedback.lightImpact();
        showModalBottomSheet(
          context: context,
          backgroundColor: Colors.transparent,
          isScrollControlled: true,
          useSafeArea: true,
          builder: (_) =>
              _MicPermissionSheet(grantStatus: Permission.microphone.status),
        );
      },
    );
  }

  Widget _micPermissionTile(BuildContext context) {
    return _TappableRow(
      icon: Icons.open_in_new,
      title: 'Setări microfon',
      subtitle: 'Deschide setările sistemului',
      onTap: () => openAppSettings(),
    );
  }

  Widget _clearHistoryTile(BuildContext context) {
    return InkWell(
      onTap: () {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Șterge istoricul'),
            content: const Text(
                'Ești sigur că vrei să ștergi tot istoricul de verificări? Această acțiune nu poate fi anulată.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Anulează'),
              ),
              TextButton(
                onPressed: () async {
                  Navigator.of(ctx).pop();
                  HapticFeedback.heavyImpact();
                  try {
                    final repo = SavedChecksRepositoryImpl();
                    await repo.clearAll();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Istoricul a fost șters')),
                      );
                    }
                  } catch (_) {}
                },
                child: Text('Șterge',
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.error)),
              ),
            ],
          ),
        );
      },
      child: Container(
        constraints: const BoxConstraints(minHeight: 56),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            Icon(Icons.delete_outline_rounded,
                size: 20, color: Theme.of(context).colorScheme.error),
            const SizedBox(width: 12),
            Text(
              'Șterge istoricul',
              style: AppTextStyles.labelLg.copyWith(
                fontWeight: FontWeight.w500,
                fontSize: 14,
                color: Theme.of(context).colorScheme.error,
              ),
            ),
            const Spacer(),
            Icon(Icons.chevron_right, size: 18, color: _mid(context)),
          ],
        ),
      ),
    );
  }

  Widget _linkTile(BuildContext context, String title, String url) {
    return InkWell(
      onTap: () =>
          launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication),
      child: Container(
        constraints: const BoxConstraints(minHeight: 56),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            Expanded(
              child: Text(title,
                  style: AppTextStyles.labelLg.copyWith(
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                      color: _fg(context))),
            ),
            Icon(Icons.open_in_new, size: 16, color: _mid(context)),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
      child: Text(title.toUpperCase(), style: AppTextStyles.labelCaps),
    );
  }

  Widget _settingsRow(BuildContext context,
      {required String title, String? subtitle, Widget? trailing}) {
    return Container(
      constraints: const BoxConstraints(minHeight: 56),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: AppTextStyles.labelLg.copyWith(
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                        color: _fg(context))),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(subtitle,
                      style: AppTextStyles.labelMd.copyWith(
                          color: _mid(context), fontWeight: FontWeight.w400)),
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

class _TappableRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _TappableRow({
    required this.icon,
    required this.title,
    required this.onTap,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return InkWell(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 56),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            Icon(icon, size: 20, color: cs.onSurface),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: AppTextStyles.labelLg.copyWith(
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                          color: cs.onSurface)),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle!,
                        style: AppTextStyles.labelSm
                            .copyWith(color: cs.onSurfaceVariant)),
                  ],
                ],
              ),
            ),
            Icon(Icons.chevron_right, size: 18, color: cs.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}

class _MicPermissionSheet extends StatelessWidget {
  final Future<PermissionStatus> grantStatus;

  const _MicPermissionSheet({required this.grantStatus});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return BottomSheetShell(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Permisiuni microfon',
                style: AppTextStyles.headingSubsection
                    .copyWith(fontSize: 18, color: cs.onSurface)),
            const SizedBox(height: 16),
            FutureBuilder<PermissionStatus>(
              future: grantStatus,
              builder: (context, snapshot) {
                final granted = snapshot.data?.isGranted ?? false;
                return Row(
                  children: [
                    Icon(
                      granted
                          ? Icons.check_circle_rounded
                          : Icons.cancel_rounded,
                      size: 20,
                      color: granted
                          ? AppColors.verdictTrue
                          : AppColors.verdictFalse,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      granted
                          ? 'Microfonul este accesibil'
                          : 'Microfonul nu este accesibil',
                      style: AppTextStyles.bodyMd.copyWith(
                        color: granted
                            ? AppColors.verdictTrue
                            : AppColors.verdictFalse,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: AppButton(
                label: 'Deschide setările sistemului',
                variant: AppButtonVariant.outline,
                onPressed: () {
                  openAppSettings();
                  Navigator.of(context).pop();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
