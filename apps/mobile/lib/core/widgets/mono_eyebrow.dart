import 'package:flutter/material.dart';
import '../theme/app_text_styles.dart';

class MonoEyebrow extends StatelessWidget {
  final String label;

  const MonoEyebrow({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label.toUpperCase(),
      style: AppTextStyles.monoEyebrow.copyWith(color: const Color(0xFF8F8F8F)),
    );
  }
}
