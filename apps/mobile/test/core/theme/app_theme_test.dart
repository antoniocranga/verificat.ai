import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/core/theme/app_theme.dart';
import 'package:verificat_mobile/core/theme/app_spacing.dart';
import 'package:verificat_mobile/core/theme/app_radius.dart';
import 'package:verificat_mobile/core/theme/app_text_styles.dart';
import 'package:verificat_mobile/core/theme/app_colors.dart';

void main() {
  group('AppTheme', () {
    test('colorScheme surface is white', () {
      expect(appTheme.colorScheme.surface, AppColors.surfaceRaised);
    });

    test('colorScheme onSurface is ink', () {
      expect(appTheme.colorScheme.onSurface, AppColors.ink);
    });

    test('colorScheme outline is subtle', () {
      expect(appTheme.colorScheme.outline, AppColors.subtle);
    });

    test('colorScheme secondary is accent', () {
      expect(appTheme.colorScheme.secondary, AppColors.accent);
    });

    test('colorScheme primary is ink', () {
      expect(appTheme.colorScheme.primary, AppColors.ink);
    });

    test('colorScheme onPrimary is surfaceRaised', () {
      expect(appTheme.colorScheme.onPrimary, AppColors.surfaceRaised);
    });

    test('colorScheme error matches AppColors.error', () {
      expect(appTheme.colorScheme.error, AppColors.error);
    });

    test('scaffoldBackgroundColor is canvas', () {
      expect(appTheme.scaffoldBackgroundColor, AppColors.canvas);
    });
  });

  group('TextTheme', () {
    test('displayLarge uses Poppins 700 48px h:1.1 ls:-1.92', () {
      final style = appTheme.textTheme.displayLarge!;
      expect(style.fontFamily, 'Poppins');
      expect(style.fontWeight, FontWeight.w700);
      expect(style.fontSize, 48);
      expect(style.height, 1.1);
      expect(style.letterSpacing, -1.92);
    });

    test('headlineLarge uses Poppins 600 32px h:1.2 ls:-0.8', () {
      final style = appTheme.textTheme.headlineLarge!;
      expect(style.fontFamily, 'Poppins');
      expect(style.fontWeight, FontWeight.w600);
      expect(style.fontSize, 32);
      expect(style.height, 1.2);
      expect(style.letterSpacing, -0.8);
    });

    test('headlineMedium uses Poppins 600 24px h:1.25 ls:-0.48', () {
      final style = appTheme.textTheme.headlineMedium!;
      expect(style.fontFamily, 'Poppins');
      expect(style.fontWeight, FontWeight.w600);
      expect(style.fontSize, 24);
      expect(style.height, 1.25);
      expect(style.letterSpacing, -0.48);
    });

    test('labelLarge uses Poppins 600 15px h:1.0 ls:-0.2', () {
      final style = appTheme.textTheme.labelLarge!;
      expect(style.fontFamily, 'Poppins');
      expect(style.fontWeight, FontWeight.w600);
      expect(style.fontSize, 15);
      expect(style.height, 1.0);
      expect(style.letterSpacing, -0.2);
    });

    test('bodyLarge uses Lora 400 16px h:1.75 ls:0', () {
      final style = appTheme.textTheme.bodyLarge!;
      expect(style.fontFamily, 'Lora');
      expect(style.fontWeight, FontWeight.w400);
      expect(style.fontSize, 16);
      expect(style.height, 1.75);
      expect(style.letterSpacing, 0);
    });

    test('bodyMedium uses Lora 400 14px h:1.65 ls:0', () {
      final style = appTheme.textTheme.bodyMedium!;
      expect(style.fontFamily, 'Lora');
      expect(style.fontWeight, FontWeight.w400);
      expect(style.fontSize, 14);
      expect(style.height, 1.65);
      expect(style.letterSpacing, 0);
    });

    test('bodySmall uses Lora 400 12px h:1.6 ls:0', () {
      final style = appTheme.textTheme.bodySmall!;
      expect(style.fontFamily, 'Lora');
      expect(style.fontWeight, FontWeight.w400);
      expect(style.fontSize, 12);
      expect(style.height, 1.6);
      expect(style.letterSpacing, 0);
    });
  });

  group('AppTextStyles', () {
    test('monoEyebrow uses JetBrains Mono 500 12px ls:0.96', () {
      expect(AppTextStyles.monoEyebrow.fontFamily, 'JetBrains Mono');
      expect(AppTextStyles.monoEyebrow.fontWeight, FontWeight.w500);
      expect(AppTextStyles.monoEyebrow.fontSize, 12);
      expect(AppTextStyles.monoEyebrow.letterSpacing, 0.96);
    });
  });

  group('AppSpacing', () {
    test('values match 8-point grid', () {
      expect(AppSpacing.xxs, 4);
      expect(AppSpacing.xs, 8);
      expect(AppSpacing.sm, 12);
      expect(AppSpacing.md, 16);
      expect(AppSpacing.lg, 24);
      expect(AppSpacing.xl, 32);
      expect(AppSpacing.xl2, 40);
      expect(AppSpacing.xl3, 64);
      expect(AppSpacing.xl4, 96);
      expect(AppSpacing.section, 128);
    });
  });

  group('AppRadius', () {
    test('values match spec', () {
      expect(AppRadius.none, 0);
      expect(AppRadius.sm, 6);
      expect(AppRadius.md, 12);
      expect(AppRadius.lg, 16);
      expect(AppRadius.pill, 100);
      expect(AppRadius.full, 9999);
    });
  });
}
