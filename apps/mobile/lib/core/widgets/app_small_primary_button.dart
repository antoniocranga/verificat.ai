import 'package:flutter/material.dart';

class AppSmallPrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final Color? foregroundColor;

  const AppSmallPrimaryButton({super.key, required this.label, this.onPressed, this.foregroundColor});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF171717),
        foregroundColor: foregroundColor ?? const Color(0xFFFFFFFF),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w500, fontSize: 14),
        padding: const EdgeInsets.symmetric(horizontal: 6),
      ),
      child: Text(label),
    );
  }
}
