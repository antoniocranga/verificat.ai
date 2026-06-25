import 'package:flutter/material.dart';

class AppPrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const AppPrimaryButton({super.key, required this.label, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF171717),
        foregroundColor: const Color(0xFFFFFFFF),
        shape: const StadiumBorder(),
        textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w500, fontSize: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14),
        visualDensity: VisualDensity.compact,
      ),
      child: Text(label),
    );
  }
}
