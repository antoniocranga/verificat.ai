import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class VerdictUtils {
  static Color getColor(String label) {
    return AppColors.forVerdict(label);
  }

  static String translate(String label) {
    return switch (label.toLowerCase()) {
      'true' => 'Adevărat',
      'mostly true' => 'Majoritar adevărat',
      'partially true' => 'Parțial adevărat',
      'uncertain' => 'Incert',
      'misleading' => 'Înșelător',
      'false' => 'Fals',
      'unverified' || 'neverificat' => 'Neverificat',
      _ => label,
    };
  }
}
