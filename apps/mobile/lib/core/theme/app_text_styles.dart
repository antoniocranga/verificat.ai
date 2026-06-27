import 'package:flutter/material.dart';

/// Full typography scale for verificat.xyz.
/// Poppins = display / UI / labels
/// Lora    = body copy (needs room — use height ≥ 1.6)
/// JetBrains Mono = code / eyebrow
abstract final class AppTextStyles {
  AppTextStyles._();

  // ── Display ────────────────────────────────────────────────────
  /// Hero heading — 48px Poppins Bold, tight tracking
  static const headingDisplay = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w700,
    fontSize: 48,
    height: 1.1,
    letterSpacing: -1.92, // -0.04em at 48px
    color: Color(0xFF141413),
  );

  /// Section heading — 32px Poppins SemiBold
  static const headingSection = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w600,
    fontSize: 32,
    height: 1.2,
    letterSpacing: -0.8, // -0.025em
    color: Color(0xFF141413),
  );

  /// Sub-section heading — 20px Poppins SemiBold
  static const headingSubsection = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w600,
    fontSize: 20,
    height: 1.3,
    letterSpacing: -0.4,
    color: Color(0xFF141413),
  );

  // ── Body ───────────────────────────────────────────────────────
  /// Primary body text — 16px Lora Regular
  static const bodyLg = TextStyle(
    fontFamily: 'Lora',
    fontWeight: FontWeight.w400,
    fontSize: 16,
    height: 1.75,
    letterSpacing: 0,
    color: Color(0xFF141413),
  );

  /// Secondary body text — 14px Lora Regular
  static const bodyMd = TextStyle(
    fontFamily: 'Lora',
    fontWeight: FontWeight.w400,
    fontSize: 14,
    height: 1.6,
    letterSpacing: 0,
    color: Color(0xFF141413),
  );

  // ── UI Labels ─────────────────────────────────────────────────
  /// Button / chip labels — 15px Poppins SemiBold
  static const labelLg = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w600,
    fontSize: 15,
    height: 1.0,
    letterSpacing: -0.2,
  );

  /// Small labels — 13px Poppins Medium
  static const labelMd = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w500,
    fontSize: 13,
    height: 1.0,
    letterSpacing: -0.1,
  );

  /// Uppercase eyebrow — 11px Poppins Medium, wide tracking
  static const labelCaps = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w500,
    fontSize: 11,
    height: 1.4,
    letterSpacing: 0.66, // 0.06em at 11px
    color: Color(0xFFB0AEA5),
  );

  // ── Mono ───────────────────────────────────────────────────────
  /// Monospaced eyebrow / code inline — 12px JetBrains Mono
  static const monoEyebrow = TextStyle(
    fontFamily: 'JetBrains Mono',
    fontWeight: FontWeight.w500,
    fontSize: 12,
    height: 1.4,
    letterSpacing: 0.96, // 0.08em
  );
}
