import 'package:flutter/material.dart';

/// Warm-tinted shadow system — mirrors the CSS --shadow-* tokens.
/// Usage: Container(decoration: BoxDecoration(boxShadow: AppShadows.sm))
abstract final class AppShadows {
  AppShadows._();

  /// 1px lift — subtle card edge
  static const sm = [
    BoxShadow(
      color: Color(0x0F141413), // rgba(20,20,19,0.06)
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  /// 4px–12px — hover cards, popovers
  static const md = [
    BoxShadow(
      color: Color(0x14141413), // rgba(20,20,19,0.08)
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x0F141413), // rgba(20,20,19,0.06)
      blurRadius: 3,
      offset: Offset(0, 1),
    ),
  ];

  /// 16px–48px — modals, overlays
  static const lg = [
    BoxShadow(
      color: Color(0x1E141413), // rgba(20,20,19,0.12)
      blurRadius: 48,
      offset: Offset(0, 16),
    ),
    BoxShadow(
      color: Color(0x14141413), // rgba(20,20,19,0.08)
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
  ];

  /// Accent glow — for accent-coloured CTAs
  static const accent = [
    BoxShadow(
      color: Color(0x3DD97757), // rgba(217,119,87,0.24)
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  /// Primary button shadow (warm, subtle)
  static const primaryButton = [
    BoxShadow(
      color: Color(0x1E141413), // rgba(20,20,19,0.12)
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];
}
