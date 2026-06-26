import 'package:flutter/material.dart';

/// Single source of truth for all Color constants.
/// No raw Color(0xFF...) literals should appear in widget files.
abstract final class AppColors {
  AppColors._();

  // ── Core palette ─────────────────────────────────────────────
  static const canvas  = Color(0xFFFAF9F5); // warm off-white canvas
  static const ink     = Color(0xFF141413); // warm near-black
  static const inkSub  = Color(0xFF3A3935); // secondary text
  static const mid     = Color(0xFFB0AEA5); // muted / placeholder
  static const subtle  = Color(0xFFE8E6DC); // hairline / borders
  static const accent  = Color(0xFFD97757); // terracotta CTA
  static const blue    = Color(0xFF6A9BCC); // links / info
  static const green   = Color(0xFF788C5D); // success

  // ── Surface stack ─────────────────────────────────────────────
  static const surfaceBase    = Color(0xFFFAF9F5); // page background
  static const surfaceRaised  = Color(0xFFFFFFFF); // cards, inputs
  static const surfaceOverlay = Color(0xFFFFFFFF); // menus, modals
  static const surfaceInset   = Color(0xFFF0EDE6); // code blocks, sunken

  // ── Verdict colours ───────────────────────────────────────────
  static const verdictTrue        = Color(0xFF5A8A5A);
  static const verdictMostlyTrue  = Color(0xFF6A8A40);
  static const verdictPartial     = Color(0xFFB07030);
  static const verdictMisleading  = Color(0xFFB05A30);
  static const verdictFalse       = Color(0xFFC04040);
  static const verdictUnverified  = Color(0xFFB0AEA5); // same as mid

  // ── Semantic ──────────────────────────────────────────────────
  static const error   = Color(0xFFC94040);
  static const warning = Color(0xFFC98040);
  static const success = green;

  // ── Helpers ───────────────────────────────────────────────────
  /// Returns the canonical colour for a given verdict label string.
  static Color forVerdict(String label) => switch (label) {
    'True'          => verdictTrue,
    'Mostly True'   => verdictMostlyTrue,
    'Partially True' => verdictPartial,
    'Misleading'    => verdictMisleading,
    'False'         => verdictFalse,
    _               => verdictUnverified,
  };
}
