import 'package:flutter/material.dart';
import '../theme/app_text_styles.dart';
import 'app_button.dart';

enum AppEmptyStateType { empty, error, networkError }

/// Empty state component — the designed "nothing here" moment.
///
/// Always include: icon + title + description + optional CTA.
/// Never show a blank screen; always show a designed state.
class AppEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final String? actionLabel;
  final VoidCallback? onAction;
  final AppEmptyStateType type;

  const AppEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    this.actionLabel,
    this.onAction,
    this.type = AppEmptyStateType.empty,
  });

  Color _iconContainerColor(BuildContext context) => switch (type) {
    AppEmptyStateType.empty        => Theme.of(context).colorScheme.outline.withValues(alpha: 0.6),
    AppEmptyStateType.error        => Theme.of(context).colorScheme.error.withValues(alpha: 0.08),
    AppEmptyStateType.networkError => Theme.of(context).colorScheme.error.withValues(alpha: 0.08),
  };

  Color _iconColor(BuildContext context) => switch (type) {
    AppEmptyStateType.empty        => Theme.of(context).colorScheme.outlineVariant,
    AppEmptyStateType.error        => Theme.of(context).colorScheme.error,
    AppEmptyStateType.networkError => Theme.of(context).colorScheme.error,
  };

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon container
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: _iconContainerColor(context),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, size: 28, color: _iconColor(context)),
            ),
            const SizedBox(height: 20),

            // Title — Poppins SemiBold
            Text(
              title,
              style: AppTextStyles.headingSubsection.copyWith(
                fontSize: 16,
                letterSpacing: -0.3,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),

            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 280),
              child: Text(
                description,
                style: AppTextStyles.bodyMd.copyWith(
                  color: Theme.of(context).colorScheme.outlineVariant,
                  height: 1.65,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            // CTA
            if (actionLabel != null) ...[
              const SizedBox(height: 24),
              AppButton.secondary(
                label: actionLabel!,
                onPressed: onAction,
                width: null,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
