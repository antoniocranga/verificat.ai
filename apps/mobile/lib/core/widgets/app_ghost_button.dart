import 'package:flutter/material.dart';

class AppGhostButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final Color? foregroundColor;

  const AppGhostButton({super.key, required this.label, this.onPressed, this.foregroundColor});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        backgroundColor: const Color(0xFFFFFFFF),
        foregroundColor: foregroundColor ?? const Color(0xFF171717),
        side: const BorderSide(color: Color(0xFFEBEBEB)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w500, fontSize: 14),
        padding: const EdgeInsets.symmetric(horizontal: 6),
      ),
      child: Text(label),
    );
  }
}
