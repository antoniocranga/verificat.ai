import 'package:flutter/material.dart';
import 'app_colors.dart';

TextTheme _buildTextTheme(Color inkColor) {
  return const TextTheme(
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
      fontSize: 20,
      height: 1.3,
      letterSpacing: -0.4,
    ),
    headlineSmall: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 18,
      height: 1.35,
      letterSpacing: -0.3,
    ),
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
    bodyLarge: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w400,
      fontSize: 16,
      height: 1.75,
      letterSpacing: 0,
    ),
    bodyMedium: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w400,
      fontSize: 14,
      height: 1.6,
      letterSpacing: 0,
    ),
    bodySmall: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w400,
      fontSize: 12,
      height: 1.5,
      letterSpacing: 0,
    ),
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
  ).apply(bodyColor: inkColor, displayColor: inkColor);
}

final ThemeData appThemeLight = ThemeData(
  useMaterial3: true,
  colorScheme: const ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.ink,
    onPrimary: AppColors.surfaceRaised,
    primaryContainer: AppColors.surfaceRaised,
    onPrimaryContainer: AppColors.ink,
    secondary: AppColors.accent,
    onSecondary: AppColors.surfaceRaised,
    secondaryContainer: AppColors.accentSecondary,
    onSecondaryContainer: AppColors.accent,
    surface: AppColors.surfaceRaised,
    onSurface: AppColors.ink,
    surfaceContainerHighest: AppColors.surfaceInset,
    error: AppColors.error,
    onError: AppColors.surfaceRaised,
    outline: AppColors.subtle,
    outlineVariant: AppColors.mid,
  ),
  scaffoldBackgroundColor: AppColors.canvas,
  textTheme: _buildTextTheme(AppColors.ink),
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
  dividerTheme: const DividerThemeData(
    color: AppColors.subtle,
    thickness: 1,
    space: 0,
  ),
  textSelectionTheme: TextSelectionThemeData(
    cursorColor: AppColors.accent,
    selectionColor: AppColors.accent.withValues(alpha: 0.3),
    selectionHandleColor: AppColors.accent,
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: AppColors.surfaceRaised,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.subtle),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.subtle),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.accent, width: 1.5),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
  ),
  floatingActionButtonTheme: const FloatingActionButtonThemeData(
    shape: CircleBorder(),
  ),
);

final ThemeData appThemeDark = ThemeData(
  useMaterial3: true,
  colorScheme: const ColorScheme(
    brightness: Brightness.dark,
    primary: AppColors.darkInk,
    onPrimary: AppColors.darkSurfaceRaised,
    primaryContainer: AppColors.darkSurfaceRaised,
    onPrimaryContainer: AppColors.darkInk,
    secondary: AppColors.darkAccent,
    onSecondary: AppColors.darkSurfaceRaised,
    secondaryContainer: AppColors.darkAccentSecondary,
    onSecondaryContainer: AppColors.darkAccent,
    surface: AppColors.darkSurfaceRaised,
    onSurface: AppColors.darkInk,
    surfaceContainerHighest: AppColors.darkSurfaceInset,
    error: AppColors.error,
    onError: AppColors.darkSurfaceRaised,
    outline: AppColors.darkSubtle,
    outlineVariant: AppColors.darkMid,
  ),
  scaffoldBackgroundColor: AppColors.darkCanvas,
  textTheme: _buildTextTheme(AppColors.darkInk),
  appBarTheme: const AppBarTheme(
    backgroundColor: AppColors.darkCanvas,
    foregroundColor: AppColors.darkInk,
    elevation: 0,
    scrolledUnderElevation: 0,
    titleTextStyle: TextStyle(
      fontFamily: 'Poppins',
      fontWeight: FontWeight.w600,
      fontSize: 17,
      letterSpacing: -0.3,
      color: AppColors.darkInk,
    ),
    iconTheme: IconThemeData(color: AppColors.darkInk, size: 22),
  ),
  dividerTheme: const DividerThemeData(
    color: AppColors.darkSubtle,
    thickness: 1,
    space: 0,
  ),
  textSelectionTheme: TextSelectionThemeData(
    cursorColor: AppColors.darkAccent,
    selectionColor: AppColors.darkAccent.withValues(alpha: 0.3),
    selectionHandleColor: AppColors.darkAccent,
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: AppColors.darkSurfaceRaised,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.darkSubtle),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.darkSubtle),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.darkAccent, width: 1.5),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
  ),
  floatingActionButtonTheme: const FloatingActionButtonThemeData(
    shape: CircleBorder(),
  ),
);

// Fallback alias
final ThemeData appTheme = appThemeLight;
