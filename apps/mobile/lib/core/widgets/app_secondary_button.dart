import 'package:flutter/material.dart';

class AppSecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const AppSecondaryButton({super.key, required this.label, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFFFFFFFF),
        foregroundColor: const Color(0xFF171717),
        shape: const StadiumBorder(),
        side: const BorderSide(color: Color(0xFFEBEBEB)),
        textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w500, fontSize: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14),
        visualDensity: VisualDensity.compact,
      ),
      child: Text(label),
    );
  }
}
