/// @deprecated Use AppButton instead.
library;
export 'app_button.dart' show AppButton, AppButtonVariant, AppButtonSize;

import 'package:flutter/material.dart';
import 'app_button.dart';

/// @deprecated Use AppButton(variant: AppButtonVariant.primary) instead.
class AppPrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const AppPrimaryButton({super.key, required this.label, this.onPressed});

  @override
  Widget build(BuildContext context) => AppButton(
        label: label,
        onPressed: onPressed,
        variant: AppButtonVariant.primary,
        width: null,
      );
}

/// @deprecated Use AppButton(variant: AppButtonVariant.secondary) instead.
class AppSecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const AppSecondaryButton({super.key, required this.label, this.onPressed});

  @override
  Widget build(BuildContext context) => AppButton(
        label: label,
        onPressed: onPressed,
        variant: AppButtonVariant.secondary,
        width: null,
      );
}

/// @deprecated Use AppButton(variant: AppButtonVariant.ghost) instead.
class AppGhostButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const AppGhostButton({super.key, required this.label, this.onPressed});

  @override
  Widget build(BuildContext context) => AppButton(
        label: label,
        onPressed: onPressed,
        variant: AppButtonVariant.ghost,
        width: null,
      );
}

/// @deprecated Use AppButton(size: AppButtonSize.sm) instead.
class AppSmallPrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final Color? foregroundColor; // kept for API compat, mapped to destructive if red

  const AppSmallPrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.foregroundColor,
  });

  @override
  Widget build(BuildContext context) {
    // Check if foregroundColor is in the red range (destructive action)
    final isDestructive = foregroundColor != null &&
        (foregroundColor!.r * 255).round() > 150 &&
        (foregroundColor!.g * 255).round() < 100;
    return AppButton(
      label: label,
      onPressed: onPressed,
      variant: isDestructive
          ? AppButtonVariant.destructive
          : AppButtonVariant.primary,
      size: AppButtonSize.sm,
      width: null,
    );
  }
}
