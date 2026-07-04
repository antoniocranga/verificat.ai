import 'package:flutter/material.dart';

/// Full typography scale for verificat.xyz.
/// Poppins = display / UI / labels
/// Lora    = body copy (needs room — use height ≥ 1.6)
/// JetBrains Mono = code / eyebrow
abstract final class AppTextStyles {
  AppTextStyles._();

  // ── Display ────────────────────────────────────────────────────
  static const headingDisplay = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w700,
    fontSize: 48,
    height: 1.1,
    letterSpacing: -1.92,
  );

  static const headingSection = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w600,
    fontSize: 32,
    height: 1.2,
    letterSpacing: -0.8,
  );

  static const headingSubsection = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w600,
    fontSize: 20,
    height: 1.3,
    letterSpacing: -0.4,
  );

  // ── Body ───────────────────────────────────────────────────────
  static const bodyLg = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w400,
    fontSize: 16,
    height: 1.75,
    letterSpacing: 0,
  );

  static const bodyMd = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w400,
    fontSize: 14,
    height: 1.6,
    letterSpacing: 0,
  );

  static const bodySm = TextStyle(
    fontFamily: 'Lora',
    fontWeight: FontWeight.w400,
    fontSize: 12,
    height: 1.5,
    letterSpacing: 0,
  );

  // ── UI Labels ─────────────────────────────────────────────────
  static const labelLg = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w600,
    fontSize: 15,
    height: 1.0,
    letterSpacing: -0.2,
  );

  static const labelMd = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w500,
    fontSize: 13,
    height: 1.0,
    letterSpacing: -0.1,
  );

  static const labelSm = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w500,
    fontSize: 11,
    height: 1.0,
    letterSpacing: 0,
  );

  static const labelCaps = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w500,
    fontSize: 11,
    height: 1.4,
    letterSpacing: 0.66,
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
