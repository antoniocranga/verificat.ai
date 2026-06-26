import 'package:flutter/material.dart';
import 'liquid_glass_bottom_nav.dart';

class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      extendBody: true,
      bottomNavigationBar: const LiquidGlassBottomNav(),
    );
  }
}
