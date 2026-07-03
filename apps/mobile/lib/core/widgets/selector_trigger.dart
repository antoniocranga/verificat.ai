import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_text_styles.dart';
import 'bottom_sheet_shell.dart';

class SelectorOption<T> {
  final T value;
  final String label;
  final IconData? icon;
  final String? subtitle;

  const SelectorOption({
    required this.value,
    required this.label,
    this.icon,
    this.subtitle,
  });
}

class SelectorTrigger<T> extends StatelessWidget {
  final String title;
  final T currentValue;
  final List<SelectorOption<T>> options;
  final ValueChanged<T> onChanged;
  final bool disabled;

  const SelectorTrigger({
    super.key,
    required this.title,
    required this.currentValue,
    required this.options,
    required this.onChanged,
    this.disabled = false,
  });

  String get _currentLabel {
    final match = options.where((o) => o.value == currentValue);
    return match.isNotEmpty ? match.first.label : '';
  }

  @override
  Widget build(BuildContext context) {
    final opacity = disabled ? 0.4 : 1.0;

    return Semantics(
      label: '$title, valoare curentă: $_currentLabel',
      button: true,
      enabled: !disabled,
      child: _PressScale(
        onTap: disabled ? null : () => _openSheet(context),
        child: AnimatedOpacity(
          duration: const Duration(milliseconds: 150),
          opacity: opacity,
          child: Container(
            constraints: const BoxConstraints(minHeight: 56),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: AppTextStyles.labelLg.copyWith(
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (_currentLabel.isNotEmpty)
                  Text(
                    _currentLabel,
                    style: AppTextStyles.labelMd,
                  ),
                const SizedBox(width: 4),
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 18,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openSheet(BuildContext context) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _SelectorSheet<T>(
        title: title,
        options: options,
        currentValue: currentValue,
        onChanged: onChanged,
      ),
    );
  }
}

class _PressScale extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;

  const _PressScale({required this.child, this.onTap});

  @override
  State<_PressScale> createState() => _PressScaleState();
}

class _PressScaleState extends State<_PressScale>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _scale = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onTap != null ? (_) => _controller.forward() : null,
      onTapUp: widget.onTap != null ? (_) => _controller.reverse() : null,
      onTapCancel: () => _controller.reverse(),
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _scale,
        builder: (context, child) => Transform.scale(
          scale: _scale.value,
          child: child,
        ),
        child: widget.child,
      ),
    );
  }
}

class _SelectorSheet<T> extends StatefulWidget {
  final String title;
  final List<SelectorOption<T>> options;
  final T currentValue;
  final ValueChanged<T> onChanged;

  const _SelectorSheet({
    required this.title,
    required this.options,
    required this.currentValue,
    required this.onChanged,
  });

  @override
  State<_SelectorSheet<T>> createState() => _SelectorSheetState<T>();
}

class _SelectorSheetState<T> extends State<_SelectorSheet<T>> {
  late T _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.currentValue;
  }

  void _select(SelectorOption<T> option) {
    if (option.value == _selected) {
      Navigator.of(context).pop();
      return;
    }

    HapticFeedback.selectionClick();
    setState(() => _selected = option.value);
    widget.onChanged(option.value);
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return BottomSheetShell(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Text(
              widget.title,
              style: AppTextStyles.headingSubsection
                  .copyWith(fontSize: 18, color: cs.onSurface),
            ),
          ),
          const SizedBox(height: 4),
          ListView.separated(
            shrinkWrap: true,
            padding: const EdgeInsets.only(bottom: 16),
            itemCount: widget.options.length,
            separatorBuilder: (_, __) =>
                const Divider(height: 1, indent: 20, endIndent: 20),
            itemBuilder: (context, index) {
              final option = widget.options[index];
              final isSelected = option.value == _selected;

              return Semantics(
                button: true,
                label: option.label,
                selected: isSelected,
                child: InkWell(
                  onTap: () => _select(option),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 14),
                    child: Row(
                      children: [
                        if (option.icon != null) ...[
                          Icon(option.icon,
                              size: 20,
                              color: isSelected
                                  ? cs.secondary
                                  : cs.onSurfaceVariant),
                          const SizedBox(width: 12),
                        ],
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                option.label,
                                style: AppTextStyles.bodyMd.copyWith(
                                  fontWeight: FontWeight.w500,
                                  color: isSelected
                                      ? cs.secondary
                                      : cs.onSurface,
                                ),
                              ),
                              if (option.subtitle != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  option.subtitle!,
                                  style: AppTextStyles.labelSm
                                      .copyWith(color: cs.onSurfaceVariant),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        _RadioIndicator(
                          selected: isSelected,
                          accentColor: cs.secondary,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _RadioIndicator extends StatefulWidget {
  final bool selected;
  final Color accentColor;

  const _RadioIndicator({required this.selected, required this.accentColor});

  @override
  State<_RadioIndicator> createState() => _RadioIndicatorState();
}

class _RadioIndicatorState extends State<_RadioIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _scale = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.1), weight: 1),
      TweenSequenceItem(tween: Tween(begin: 1.1, end: 1.0), weight: 1),
    ]).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    if (widget.selected) _controller.value = 1.0;
  }

  @override
  void didUpdateWidget(_RadioIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selected && !oldWidget.selected) {
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return AnimatedBuilder(
      animation: _scale,
      builder: (context, _) {
        return Transform.scale(
          scale: _scale.value,
          child: Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: widget.selected ? widget.accentColor : Colors.transparent,
              border: Border.all(
                color: widget.selected
                    ? widget.accentColor
                    : cs.onSurfaceVariant.withValues(alpha: 0.5),
                width: 2,
              ),
            ),
            child: widget.selected
                ? Center(
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: cs.onSecondary,
                          shape: BoxShape.circle,
                        ),
                      ),
                  )
                : null,
          ),
        );
      },
    );
  }
}
