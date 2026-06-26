import 'package:flutter/material.dart';
import 'app_surface.dart';

/// A content card — uses the raised surface elevation system.
/// Replaces the old hardcoded #ffffff/#ebebeb card.
class AppFeatureCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const AppFeatureCard({
    super.key,
    required this.child,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return AppSurface(
      elevation: AppSurfaceElevation.raised,
      padding: padding ?? const EdgeInsets.all(24),
      child: child,
    );
  }
}
