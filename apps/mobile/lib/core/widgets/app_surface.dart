import 'package:flutter/material.dart';
import '../theme/app_shadows.dart';
import '../theme/app_radius.dart';
import '../theme/app_colors.dart';

/// Surface elevation levels — mirror the CSS surface stack.
enum AppSurfaceElevation { base, raised, overlay, inset }

/// Surface widget — consistent elevation, background, and border-radius.
///
/// Usage:
/// ```dart
/// AppSurface(
///   elevation: AppSurfaceElevation.raised,
///   child: ...,
/// )
/// ```
class AppSurface extends StatelessWidget {
  final Widget child;
  final AppSurfaceElevation elevation;
  final double? borderRadius;
  final EdgeInsetsGeometry? padding;
  final Border? border;

  const AppSurface({
    super.key,
    required this.child,
    this.elevation = AppSurfaceElevation.raised,
    this.borderRadius,
    this.padding,
    this.border,
  });

  Color _bgColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return switch (elevation) {
      AppSurfaceElevation.base    => isDark ? AppColors.darkSurfaceBase : AppColors.surfaceBase,
      AppSurfaceElevation.raised  => isDark ? AppColors.darkSurfaceRaised : AppColors.surfaceRaised,
      AppSurfaceElevation.overlay => isDark ? AppColors.darkSurfaceOverlay : AppColors.surfaceOverlay,
      AppSurfaceElevation.inset   => isDark ? AppColors.darkSurfaceInset : AppColors.surfaceInset,
    };
  }

  List<BoxShadow> get _shadows => switch (elevation) {
    AppSurfaceElevation.base    => const [],
    AppSurfaceElevation.raised  => AppShadows.sm,
    AppSurfaceElevation.overlay => AppShadows.lg,
    AppSurfaceElevation.inset   => const [
      BoxShadow(
        color: Color(0x0F141413),
        blurRadius: 4,
        offset: Offset(0, 1),
        spreadRadius: -1,
      ),
    ],
  };

  Border? _getBorder(BuildContext context) {
    if (border != null) return border;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return switch (elevation) {
      AppSurfaceElevation.raised => Border.all(
        color: isDark ? AppColors.darkSubtle : AppColors.subtle,
        width: 1,
      ),
      _ => null,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: _bgColor(context),
        borderRadius: BorderRadius.circular(borderRadius ?? AppRadius.md),
        border: _getBorder(context),
        boxShadow: _shadows,
      ),
      child: child,
    );
  }
}
