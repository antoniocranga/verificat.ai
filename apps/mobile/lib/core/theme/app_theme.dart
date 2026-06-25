import 'package:flutter/material.dart';

const Color _surface = Color(0xFFFAFAFA);
const Color _onSurface = Color(0xFF171717);
const Color _outline = Color(0xFFEBEBEB);
const Color _secondary = Color(0xFF4D4D4D);
const Color _primary = Color(0xFF171717);
const Color _onPrimary = Color(0xFFFFFFFF);
const Color _error = Color(0xFFEE0000);

const ColorScheme _colorScheme = ColorScheme(
  primary: _primary,
  onPrimary: _onPrimary,
  primaryContainer: _onPrimary,
  onPrimaryContainer: _primary,
  secondary: _secondary,
  onSecondary: _onPrimary,
  secondaryContainer: _onPrimary,
  onSecondaryContainer: _secondary,
  surface: _surface,
  onSurface: _onSurface,
  background: _surface,
  onBackground: _onSurface,
  error: _error,
  onError: _onPrimary,
  errorContainer: _onPrimary,
  onErrorContainer: _error,
  outline: _outline,
  brightness: Brightness.light,
);

const TextTheme _textTheme = TextTheme(
  displayLarge: TextStyle(
    fontFamily: 'Inter',
    fontWeight: FontWeight.w600,
    fontSize: 48,
    height: 48 / 48,
    letterSpacing: -2.4,
  ),
  headlineLarge: TextStyle(
    fontFamily: 'Inter',
    fontWeight: FontWeight.w600,
    fontSize: 32,
    height: 40 / 32,
    letterSpacing: -1.28,
  ),
  headlineMedium: TextStyle(
    fontFamily: 'Inter',
    fontWeight: FontWeight.w600,
    fontSize: 20,
    height: 28 / 20,
    letterSpacing: -0.4,
  ),
  labelLarge: TextStyle(
    fontFamily: 'Inter',
    fontWeight: FontWeight.w500,
    fontSize: 14,
    height: 20 / 14,
    letterSpacing: -0.28,
  ),
  bodyLarge: TextStyle(
    fontFamily: 'Inter',
    fontWeight: FontWeight.w400,
    fontSize: 16,
    height: 24 / 16,
    letterSpacing: 0,
  ),
  bodyMedium: TextStyle(
    fontFamily: 'Inter',
    fontWeight: FontWeight.w400,
    fontSize: 14,
    height: 20 / 14,
    letterSpacing: 0,
  ),
  bodySmall: TextStyle(
    fontFamily: 'Inter',
    fontWeight: FontWeight.w400,
    fontSize: 12,
    height: 16 / 12,
    letterSpacing: 0,
  ),
);

ThemeData get appTheme => ThemeData(
  colorScheme: _colorScheme,
  textTheme: _textTheme,
  scaffoldBackgroundColor: _surface,
  useMaterial3: true,
);
