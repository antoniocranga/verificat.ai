import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/core/theme/app_theme.dart';
import 'package:verificat_mobile/core/theme/app_spacing.dart';
import 'package:verificat_mobile/core/theme/app_radius.dart';
import 'package:verificat_mobile/core/theme/app_text_styles.dart';

void main() {
  group('AppTheme', () {
    test('colorScheme surface is #FAFAFA', () {
      expect(appTheme.colorScheme.surface, const Color(0xFFFAFAFA));
    });

    test('colorScheme onSurface is #171717', () {
      expect(appTheme.colorScheme.onSurface, const Color(0xFF171717));
    });

    test('colorScheme outline is #EBEBEB', () {
      expect(appTheme.colorScheme.outline, const Color(0xFFEBEBEB));
    });

    test('colorScheme secondary is #4D4D4D', () {
      expect(appTheme.colorScheme.secondary, const Color(0xFF4D4D4D));
    });

    test('colorScheme primary is #171717', () {
      expect(appTheme.colorScheme.primary, const Color(0xFF171717));
    });

    test('colorScheme onPrimary is #FFFFFF', () {
      expect(appTheme.colorScheme.onPrimary, const Color(0xFFFFFFFF));
    });

    test('colorScheme error is #EE0000', () {
      expect(appTheme.colorScheme.error, const Color(0xFFEE0000));
    });

    test('scaffoldBackgroundColor is #FAFAFA', () {
      expect(appTheme.scaffoldBackgroundColor, const Color(0xFFFAFAFA));
    });
  });

  group('TextTheme', () {
    test('displayLarge uses Inter 600 48px h:48 ls:-2.4', () {
      final style = appTheme.textTheme.displayLarge!;
      expect(style.fontFamily, 'Inter');
      expect(style.fontWeight, FontWeight.w600);
      expect(style.fontSize, 48);
      expect(style.height, 1.0);
      expect(style.letterSpacing, -2.4);
    });

    test('headlineLarge uses Inter 600 32px h:40 ls:-1.28', () {
      final style = appTheme.textTheme.headlineLarge!;
      expect(style.fontFamily, 'Inter');
      expect(style.fontWeight, FontWeight.w600);
      expect(style.fontSize, 32);
      expect(style.height, 1.25);
      expect(style.letterSpacing, -1.28);
    });

    test('headlineMedium uses Inter 600 20px h:28 ls:-0.4', () {
      final style = appTheme.textTheme.headlineMedium!;
      expect(style.fontFamily, 'Inter');
      expect(style.fontWeight, FontWeight.w600);
      expect(style.fontSize, 20);
      expect(style.height, 1.4);
      expect(style.letterSpacing, -0.4);
    });

    test('labelLarge uses Inter 500 14px h:20 ls:-0.28', () {
      final style = appTheme.textTheme.labelLarge!;
      expect(style.fontFamily, 'Inter');
      expect(style.fontWeight, FontWeight.w500);
      expect(style.fontSize, 14);
      expect(style.height, 20 / 14);
      expect(style.letterSpacing, -0.28);
    });

    test('bodyLarge uses Inter 400 16px h:24 ls:0', () {
      final style = appTheme.textTheme.bodyLarge!;
      expect(style.fontFamily, 'Inter');
      expect(style.fontWeight, FontWeight.w400);
      expect(style.fontSize, 16);
      expect(style.height, 24 / 16);
      expect(style.letterSpacing, 0);
    });

    test('bodyMedium uses Inter 400 14px h:20 ls:0', () {
      final style = appTheme.textTheme.bodyMedium!;
      expect(style.fontFamily, 'Inter');
      expect(style.fontWeight, FontWeight.w400);
      expect(style.fontSize, 14);
      expect(style.height, 20 / 14);
      expect(style.letterSpacing, 0);
    });

    test('bodySmall uses Inter 400 12px h:16 ls:0', () {
      final style = appTheme.textTheme.bodySmall!;
      expect(style.fontFamily, 'Inter');
      expect(style.fontWeight, FontWeight.w400);
      expect(style.fontSize, 12);
      expect(style.height, 16 / 12);
      expect(style.letterSpacing, 0);
    });
  });

  group('AppTextStyles', () {
    test('monoEyebrow uses JetBrains Mono 500 12px ls:0', () {
      expect(AppTextStyles.monoEyebrow.fontFamily, 'JetBrains Mono');
      expect(AppTextStyles.monoEyebrow.fontWeight, FontWeight.w500);
      expect(AppTextStyles.monoEyebrow.fontSize, 12);
      expect(AppTextStyles.monoEyebrow.letterSpacing, 0);
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
