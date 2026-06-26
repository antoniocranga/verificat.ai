import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'liquid_glass_bottom_nav.dart';

class MainShell extends StatelessWidget {
  final Widget child;
  final int currentIndex;

  const MainShell({
    super.key,
    required this.child,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      extendBody: true,
      bottomNavigationBar: LiquidGlassBottomNav(
        currentIndex: currentIndex,
        onTap: (i) {
          final route = navTabs[i].route;
          context.go(route);
        },
      ),
    );
  }
}
