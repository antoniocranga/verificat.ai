import 'dart:ui';
import 'package:flutter/material.dart';

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
  NavTab(label: 'Caută', icon: Icons.search_outlined, activeIcon: Icons.search, route: '/search'),
  NavTab(label: 'Salvate', icon: Icons.bookmark_border, activeIcon: Icons.bookmark, route: '/saved'),
];

class LiquidGlassBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const LiquidGlassBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          height: 72 + MediaQuery.of(context).padding.bottom,
          padding: EdgeInsets.only(
            left: 8,
            right: 8,
            top: 8,
            bottom: 8 + MediaQuery.of(context).padding.bottom,
          ),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.75),
            border: Border(
              top: BorderSide(color: Colors.white.withValues(alpha: 0.3), width: 0.5),
            ),
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: List.generate(navTabs.length, (i) {
                final tab = navTabs[i];
                final selected = i == currentIndex;
                return Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => onTap(i),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      curve: Curves.easeOut,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: selected
                            ? Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.1)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            selected ? tab.activeIcon : tab.icon,
                            size: 22,
                            color: selected
                                ? Theme.of(context).colorScheme.onSurface
                                : const Color(0xFF8F8F8F),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            tab.label,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                              color: selected
                                  ? Theme.of(context).colorScheme.onSurface
                                  : const Color(0xFF8F8F8F),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}
