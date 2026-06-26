import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
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

  Color get _iconContainerColor => switch (type) {
    AppEmptyStateType.empty        => AppColors.subtle.withValues(alpha: 0.6),
    AppEmptyStateType.error        => AppColors.error.withValues(alpha: 0.08),
    AppEmptyStateType.networkError => AppColors.error.withValues(alpha: 0.08),
  };

  Color get _iconColor => switch (type) {
    AppEmptyStateType.empty        => AppColors.mid,
    AppEmptyStateType.error        => AppColors.error,
    AppEmptyStateType.networkError => AppColors.error,
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
                color: _iconContainerColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, size: 28, color: _iconColor),
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

            // Description — Lora, generous leading
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 280),
              child: Text(
                description,
                style: AppTextStyles.bodyMd.copyWith(
                  color: AppColors.mid,
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
