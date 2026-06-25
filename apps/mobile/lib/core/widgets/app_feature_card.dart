import 'package:flutter/material.dart';

class AppFeatureCard extends StatelessWidget {
  final Widget child;

  const AppFeatureCard({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFFFFFFF),
        border: Border.all(color: const Color(0xFFEBEBEB), width: 1),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(24),
      child: child,
    );
  }
}
