import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_radius.dart';
import '../theme/app_text_styles.dart';

/// Premium text input with 5 states:
/// default, focused, error, disabled, readonly
class AppTextInput extends StatelessWidget {
  final String? label;
  final String? hintText;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final TextEditingController? controller;
  final bool obscureText;
  final bool enabled;
  final TextInputType? keyboardType;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final int? maxLines;
  final TextInputAction? textInputAction;
  final VoidCallback? onEditingComplete;

  const AppTextInput({
    super.key,
    this.label,
    this.hintText,
    this.errorText,
    this.onChanged,
    this.controller,
    this.obscureText = false,
    this.enabled = true,
    this.keyboardType,
    this.prefixIcon,
    this.suffixIcon,
    this.maxLines = 1,
    this.textInputAction,
    this.onEditingComplete,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      onChanged: onChanged,
      enabled: enabled,
      keyboardType: keyboardType,
      maxLines: obscureText ? 1 : maxLines,
      textInputAction: textInputAction,
      onEditingComplete: onEditingComplete,
      style: AppTextStyles.bodyMd.copyWith(
        color: AppColors.ink,
        fontFamily: 'Poppins', // labels use Poppins for input text
        fontWeight: FontWeight.w400,
        fontSize: 14,
      ),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTextStyles.labelMd.copyWith(color: AppColors.mid),
        floatingLabelStyle: AppTextStyles.labelMd.copyWith(
          color: AppColors.accent,
          fontSize: 11,
        ),
        hintText: hintText,
        hintStyle: AppTextStyles.labelMd.copyWith(
          color: AppColors.mid,
          fontWeight: FontWeight.w400,
        ),
        errorText: errorText,
        errorStyle: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 12,
          color: AppColors.error,
        ),
        fillColor: AppColors.surfaceRaised,
        filled: true,
        prefixIcon: prefixIcon != null
            ? IconTheme(
                data: const IconThemeData(color: AppColors.mid, size: 18),
                child: prefixIcon!,
              )
            : null,
        suffixIcon: suffixIcon != null
            ? IconTheme(
                data: const IconThemeData(color: AppColors.mid, size: 18),
                child: suffixIcon!,
              )
            : null,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
        // 1. Default
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.subtle, width: 1.5),
        ),
        // 2. Focused — accent colour + simulated glow via BoxDecoration overlay
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.accent, width: 1.5),
        ),
        // 3. Error
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        // 4. Disabled
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(
            color: AppColors.subtle.withValues(alpha: 0.5),
            width: 1.5,
          ),
        ),
      ),
    );
  }
}
