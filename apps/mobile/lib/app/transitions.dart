import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Builds a page with a subtle fade + upward slide transition.
/// Duration: 220ms ease-out (matches --transition-normal from tokens).
/// Slide: 4% vertical — intentionally subtle, not dramatic.
///
/// Usage in router:
/// ```dart
/// GoRoute(
///   path: '/my-route',
///   pageBuilder: (context, state) => buildPage(const MyScreen(), state),
/// )
/// ```
Page<T> buildPage<T>(Widget child, GoRouterState state) {
  return CustomTransitionPage<T>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 220),
    reverseTransitionDuration: const Duration(milliseconds: 180),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      // Respect reduced motion system preference
      final mediaQuery = MediaQuery.of(context);
      if (mediaQuery.disableAnimations) {
        return child;
      }

      final fade = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOut,
      );

      // Exit animation: very slight slide out (secondary = going back)
      final exitSlide = Tween<Offset>(
        begin: Offset.zero,
        end: const Offset(0, -0.02),
      ).animate(
        CurvedAnimation(parent: secondaryAnimation, curve: Curves.easeIn),
      );

      // Enter animation: subtle upward fade-in
      final enterSlide = Tween<Offset>(
        begin: const Offset(0, 0.04), // 4% down → slides up into place
        end: Offset.zero,
      ).animate(fade);

      return FadeTransition(
        opacity: fade,
        child: SlideTransition(
          position: exitSlide,
          child: SlideTransition(
            position: enterSlide,
            child: child,
          ),
        ),
      );
    },
  );
}
