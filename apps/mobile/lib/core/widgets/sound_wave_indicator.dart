import 'package:flutter/material.dart';

class SoundWaveIndicator extends StatefulWidget {
  final bool active;

  const SoundWaveIndicator({super.key, required this.active});

  @override
  State<SoundWaveIndicator> createState() => _SoundWaveIndicatorState();
}

class _SoundWaveIndicatorState extends State<SoundWaveIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    if (widget.active) _controller.repeat(reverse: true);
  }

  @override
  void didUpdateWidget(SoundWaveIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.active && !oldWidget.active) {
      _controller.repeat(reverse: true);
    } else if (!widget.active && oldWidget.active) {
      _controller.stop();
      _controller.reset();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.onSurface;
    const barWidth = 4.0;
    const gap = 3.0;
    final heights = [16.0, 24.0, 32.0, 24.0, 16.0];

    return Semantics(
      label: widget.active ? 'Recording in progress' : '',
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return SizedBox(
            width: heights.length * (barWidth + gap) - gap,
            height: 40,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: heights.map((baseHeight) {
                final animValue = widget.active
                    ? (0.5 + 0.5 * _controller.value)
                    : 0.5;
                final h = baseHeight * animValue;
                return Container(
                  width: barWidth,
                  height: h,
                  margin: const EdgeInsets.only(right: gap),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(2),
                  ),
                );
              }).toList(),
            ),
          );
        },
      ),
    );
  }
}
