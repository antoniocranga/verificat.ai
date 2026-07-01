import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_colors.dart';
import '../theme/app_shadows.dart';
import '../theme/app_text_styles.dart';

enum AppButtonVariant { primary, secondary, ghost, accent, destructive }
enum AppButtonSize { sm, md, lg }

class AppButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool loading;
  final Widget? icon;
  final double? width;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.md,
    this.loading = false,
    this.icon,
    this.width,
  });

  // Named constructors for common use cases
  const AppButton.primary({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.width,
    this.size = AppButtonSize.md,
  }) : variant = AppButtonVariant.primary;

  const AppButton.secondary({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.width,
    this.size = AppButtonSize.md,
  }) : variant = AppButtonVariant.secondary;

  const AppButton.accent({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.width,
    this.size = AppButtonSize.md,
  }) : variant = AppButtonVariant.accent;

  const AppButton.ghost({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.width,
    this.size = AppButtonSize.md,
  }) : variant = AppButtonVariant.ghost;

  const AppButton.destructive({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
    this.icon,
    this.width,
    this.size = AppButtonSize.md,
  }) : variant = AppButtonVariant.destructive;

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _scale = Tween<double>(begin: 1.0, end: 0.97).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  bool get _isDisabled => widget.onPressed == null || widget.loading;

  void _onTapDown(TapDownDetails _) {
    if (_isDisabled) return;
    HapticFeedback.lightImpact();
    _controller.forward();
  }

  void _onTapUp(TapUpDetails _) => _controller.reverse();
  void _onTapCancel() => _controller.reverse();

  // ── Styling ────────────────────────────────────────────────
  double get _height => switch (widget.size) {
    AppButtonSize.sm => 34,
    AppButtonSize.md => 44,
    AppButtonSize.lg => 52,
  };

  double get _horizontalPadding => switch (widget.size) {
    AppButtonSize.sm => 12,
    AppButtonSize.md => 18,
    AppButtonSize.lg => 24,
  };

  double get _borderRadius => switch (widget.size) {
    AppButtonSize.sm => 8,
    AppButtonSize.md => 12,
    AppButtonSize.lg => 14,
  };

  TextStyle get _labelStyle => switch (widget.size) {
    AppButtonSize.sm => AppTextStyles.labelMd,
    AppButtonSize.md => AppTextStyles.labelLg,
    AppButtonSize.lg => AppTextStyles.labelLg.copyWith(fontSize: 16),
  };

  (Color bg, Color fg, Color? border, List<BoxShadow> shadows) get _colors =>
      switch (widget.variant) {
        AppButtonVariant.primary => (
          _isHovered ? const Color(0xFF2A2A28) : AppColors.ink,
          AppColors.surfaceRaised,
          null,
          _isHovered ? AppShadows.md : AppShadows.primaryButton,
        ),
        AppButtonVariant.secondary => (
          AppColors.surfaceRaised,
          AppColors.ink,
          _isHovered ? AppColors.mid : AppColors.subtle,
          _isHovered ? AppShadows.sm : const [],
        ),
        AppButtonVariant.ghost => (
          _isHovered
              ? AppColors.subtle.withValues(alpha: 0.6)
              : Colors.transparent,
          AppColors.ink,
          null,
          const [],
        ),
        AppButtonVariant.accent => (
          _isHovered ? const Color(0xFFC5694A) : AppColors.accent,
          Colors.white,
          null,
          AppShadows.accent,
        ),
        AppButtonVariant.destructive => (
          _isHovered
              ? AppColors.error.withValues(alpha: 0.06)
              : Colors.transparent,
          AppColors.error,
          _isHovered
              ? AppColors.error.withValues(alpha: 0.4)
              : AppColors.error.withValues(alpha: 0.25),
          const [],
        ),
      };

  @override
  Widget build(BuildContext context) {
    final (bg, fg, border, shadows) = _colors;

    return Semantics(
      button: true,
      enabled: !_isDisabled,
      label: widget.label,
      child: MouseRegion(
        cursor: _isDisabled
            ? SystemMouseCursors.forbidden
            : SystemMouseCursors.click,
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: GestureDetector(
          onTapDown: _isDisabled ? null : _onTapDown,
          onTapUp: _isDisabled ? null : _onTapUp,
          onTapCancel: _onTapCancel,
          onTap: _isDisabled ? null : widget.onPressed,
          child: AnimatedBuilder(
            animation: _scale,
            builder: (context, child) => Transform.scale(
              scale: _scale.value,
              child: child,
            ),
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 150),
              opacity: _isDisabled ? 0.4 : 1.0,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                curve: Curves.easeOut,
                width: widget.width,
                height: _height,
                padding: EdgeInsets.symmetric(horizontal: _horizontalPadding),
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(_borderRadius),
                  border: border != null
                      ? Border.all(color: border, width: 1.5)
                      : null,
                  boxShadow: _isDisabled ? null : shadows,
                ),
                child: Row(
                  mainAxisSize:
                      widget.width != null ? MainAxisSize.max : MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.loading)
                      SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(fg),
                        ),
                      )
                    else ...[
                      if (widget.icon != null) ...[
                        IconTheme(
                          data: IconThemeData(color: fg, size: 16),
                          child: widget.icon!,
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        widget.label,
                        style: _labelStyle.copyWith(color: fg),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
