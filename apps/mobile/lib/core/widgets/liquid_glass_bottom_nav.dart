import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NavTab {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String route;

  const NavTab({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.route,
  });
}

const navTabs = [
  NavTab(label: 'Acasă', icon: Icons.home_outlined, activeIcon: Icons.home, route: '/'),
  NavTab(label: 'Ascultă', icon: Icons.mic_outlined, activeIcon: Icons.mic, route: '/listen'),
  NavTab(label: 'Istoric', icon: Icons.history_outlined, activeIcon: Icons.history, route: '/history'),
  NavTab(label: 'Setări', icon: Icons.settings_outlined, activeIcon: Icons.settings, route: '/settings'),
];

class LiquidGlassBottomNav extends StatelessWidget {
  const LiquidGlassBottomNav({super.key});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final location = GoRouterState.of(context).matchedLocation;
    final currentIndex = navTabs.indexWhere((t) => t.route == location);
    final index = currentIndex >= 0 ? currentIndex : 0;

    final platform = Theme.of(context).platform;
    if (platform == TargetPlatform.iOS) {
      return CupertinoTabBar(
        currentIndex: index,
        onTap: (i) => context.go(navTabs[i].route),
        activeColor: cs.primary,
        inactiveColor: cs.onSurfaceVariant,
        backgroundColor: cs.surfaceContainerHighest,
        items: navTabs.map((tab) => BottomNavigationBarItem(
          icon: Icon(tab.icon),
          activeIcon: Icon(tab.activeIcon),
          label: tab.label,
        )).toList(),
      );
    }
    return NavigationBar(
      key: ValueKey(index),
      selectedIndex: index,
      onDestinationSelected: (i) => context.go(navTabs[i].route),
      backgroundColor: cs.surfaceContainerHighest,
      indicatorColor: cs.primary.withValues(alpha: 0.3),
      shadowColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
      animationDuration: const Duration(milliseconds: 100),
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      destinations: navTabs.map((tab) => NavigationDestination(
        icon: Icon(tab.icon),
        selectedIcon: Icon(tab.activeIcon),
        label: tab.label,
      )).toList(),
    );
  }
}
