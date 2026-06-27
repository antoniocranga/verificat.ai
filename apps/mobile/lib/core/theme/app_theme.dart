import 'package:flutter/material.dart';
import 'app_colors.dart';

final ThemeData appTheme = ThemeData(
  useMaterial3: true,
  colorScheme: const ColorScheme(
    brightness: Brightness.light,
    // Primary — ink on canvas (main actions)
    primary:          AppColors.ink,
    onPrimary:        AppColors.surfaceRaised,
    primaryContainer: AppColors.surfaceRaised,
    onPrimaryContainer: AppColors.ink,
    // Secondary — accent terracotta
    secondary:          AppColors.accent,
    onSecondary:        AppColors.surfaceRaised,
    secondaryContainer: Color(0xFFFAECE5), // accent/10
    onSecondaryContainer: AppColors.accent,
    // Surface
    surface:            AppColors.surfaceRaised,
    onSurface:          AppColors.ink,
    surfaceContainerHighest: AppColors.surfaceInset,
    // Error
    error:    AppColors.error,
    onError:  AppColors.surfaceRaised,
    // Outline
    outline:         AppColors.subtle,
    outlineVariant:  AppColors.mid,
  ),

  scaffoldBackgroundColor: AppColors.canvas,

  textTheme: const TextTheme(
    // Display — hero headings
    displayLarge: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w700,
      fontSize: 48,
      height: 1.1,
      letterSpacing: -1.92,
    ),
    displayMedium: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w700,
      fontSize: 36,
      height: 1.1,
      letterSpacing: -1.08,
    ),
    displaySmall: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 28,
      height: 1.15,
      letterSpacing: -0.56,
    ),
    // Headline — section titles
    headlineLarge: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 32,
      height: 1.2,
      letterSpacing: -0.8,
    ),
    headlineMedium: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 24,
      height: 1.25,
      letterSpacing: -0.48,
    ),
    headlineSmall: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 20,
      height: 1.3,
      letterSpacing: -0.4,
    ),
    // Title — card titles, modal headings
    titleLarge: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 18,
      height: 1.35,
      letterSpacing: -0.3,
    ),
    titleMedium: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontSize: 16,
      height: 1.4,
      letterSpacing: -0.16,
    ),
    titleSmall: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontSize: 14,
      height: 1.4,
      letterSpacing: -0.1,
    ),
    // Body — Lora for reading comfort
    bodyLarge: TextStyle(
      fontFamily: 'Lora',
      fontWeight: FontWeight.w400,
      fontSize: 16,
      height: 1.75,
      letterSpacing: 0,
    ),
    bodyMedium: TextStyle(
      fontFamily: 'Lora',
      fontWeight: FontWeight.w400,
      fontSize: 14,
      height: 1.65,
      letterSpacing: 0,
    ),
    bodySmall: TextStyle(
      fontFamily: 'Lora',
      fontWeight: FontWeight.w400,
      fontSize: 12,
      height: 1.6,
      letterSpacing: 0,
    ),
    // Label — Poppins for UI affordances
    labelLarge: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 15,
      height: 1.0,
      letterSpacing: -0.2,
    ),
    labelMedium: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontSize: 13,
      height: 1.0,
      letterSpacing: -0.1,
    ),
    labelSmall: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w500,
      fontSize: 11,
      height: 1.4,
      letterSpacing: 0.66,
    ),
  ),

  // AppBar
  appBarTheme: const AppBarTheme(
    backgroundColor: AppColors.canvas,
    foregroundColor: AppColors.ink,
    elevation: 0,
    scrolledUnderElevation: 0,
    titleTextStyle: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 17,
      letterSpacing: -0.3,
      color: AppColors.ink,
    ),
    iconTheme: IconThemeData(color: AppColors.ink, size: 22),
  ),

  // Divider
  dividerTheme: const DividerThemeData(
    color: AppColors.subtle,
    thickness: 1,
    space: 0,
  ),
);
