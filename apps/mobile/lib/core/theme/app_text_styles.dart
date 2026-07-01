import 'package:flutter/material.dart';

/// Full typography scale for verificat.xyz.
/// Poppins = display / UI / labels
/// Lora    = body copy (needs room — use height ≥ 1.6)
/// JetBrains Mono = code / eyebrow
abstract final class AppTextStyles {
  AppTextStyles._();

  // ── Display ────────────────────────────────────────────────────
  static const headingDisplay = TextStyle(
    fontFamily: 'Anthropic Serif',
    fontWeight: FontWeight.w700,
    fontSize: 48,
    height: 1.1,
    letterSpacing: -1.92,
    color: Color(0xFF141413),
  );

  static const headingSection = TextStyle(
    fontFamily: 'Anthropic Serif',
    fontWeight: FontWeight.w600,
    fontSize: 32,
    height: 1.2,
    letterSpacing: -0.8,
    color: Color(0xFF141413),
  );

  static const headingSubsection = TextStyle(
    fontFamily: 'Anthropic Serif',
    fontWeight: FontWeight.w600,
    fontSize: 20,
    height: 1.3,
    letterSpacing: -0.4,
    color: Color(0xFF141413),
  );

  // ── Body ───────────────────────────────────────────────────────
  static const bodyLg = TextStyle(
    fontFamily: 'Anthropic Sans',
    fontWeight: FontWeight.w400,
    fontSize: 16,
    height: 1.75,
    letterSpacing: 0,
    color: Color(0xFF141413),
  );

  static const bodyMd = TextStyle(
    fontFamily: 'Anthropic Sans',
    fontWeight: FontWeight.w400,
    fontSize: 14,
    height: 1.6,
    letterSpacing: 0,
    color: Color(0xFF141413),
  );

  static const bodySm = TextStyle(
    fontFamily: 'Anthropic Sans',
    fontWeight: FontWeight.w400,
    fontSize: 12,
    height: 1.5,
    letterSpacing: 0,
    color: Color(0xFF141413),
  );

  // ── UI Labels ─────────────────────────────────────────────────
  static const labelLg = TextStyle(
    fontFamily: 'Anthropic Serif',
    fontWeight: FontWeight.w600,
    fontSize: 15,
    height: 1.0,
    letterSpacing: -0.2,
  );

  static const labelMd = TextStyle(
    fontFamily: 'Anthropic Serif',
    fontWeight: FontWeight.w500,
    fontSize: 13,
    height: 1.0,
    letterSpacing: -0.1,
  );

  static const labelSm = TextStyle(
    fontFamily: 'Anthropic Serif',
    fontWeight: FontWeight.w500,
    fontSize: 11,
    height: 1.0,
    letterSpacing: 0,
  );

  static const labelCaps = TextStyle(
    fontFamily: 'Anthropic Serif',
    fontWeight: FontWeight.w500,
    fontSize: 11,
    height: 1.4,
    letterSpacing: 0.66,
    color: Color(0xFFB0AEA5),
  );

  // ── Mono ───────────────────────────────────────────────────────
  static const monoEyebrow = TextStyle(
    fontFamily: 'JetBrains Mono',
    fontWeight: FontWeight.w500,
    fontSize: 12,
    height: 1.4,
    letterSpacing: 0.96,
  );
}
