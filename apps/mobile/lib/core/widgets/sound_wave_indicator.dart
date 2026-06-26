import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

class SoundWaveIndicator extends StatefulWidget {
  final bool active;
  final Stream<dynamic>? amplitudeStream;

  const SoundWaveIndicator({super.key, required this.active, this.amplitudeStream});

  @override
  State<SoundWaveIndicator> createState() => _SoundWaveIndicatorState();
}

class _SoundWaveIndicatorState extends State<SoundWaveIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  StreamSubscription? _ampSub;
  double _currentAmplitude = -160.0;
  double _displayAmplitude = 0.0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    )..addListener(() {
      setState(() {
        double target = (_currentAmplitude + 50) / 50;
        target = target.clamp(0.0, 1.0);
        _displayAmplitude += (target - _displayAmplitude) * 0.3; 
      });
    });

    if (widget.active) {
      _start();
    }
  }

  void _start() {
    _controller.repeat();
    _ampSub = widget.amplitudeStream?.listen((amp) {
      if (amp != null) {
        _currentAmplitude = (amp as dynamic).current;
      }
    });
  }

  void _stop() {
    _controller.stop();
    _ampSub?.cancel();
    _ampSub = null;
    _displayAmplitude = 0.0;
  }

  @override
  void didUpdateWidget(SoundWaveIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.active && !oldWidget.active) {
      _start();
    } else if (!widget.active && oldWidget.active) {
      _stop();
    } else if (widget.active && widget.amplitudeStream != oldWidget.amplitudeStream) {
      _stop();
      _start();
    }
  }

  @override
  void dispose() {
    _stop();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.onSurface;
    const barWidth = 6.0;
    const gap = 4.0;
    final baseHeights = [16.0, 24.0, 36.0, 48.0, 36.0, 24.0, 16.0];

    return Semantics(
      label: widget.active ? 'Recording in progress' : '',
      child: SizedBox(
        width: baseHeights.length * (barWidth + gap) - gap,
        height: 64,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            for (var i = 0; i < baseHeights.length; i++)
              Builder(
                builder: (context) {
                  double phase = math.sin((DateTime.now().millisecondsSinceEpoch / 150) + i * 0.5);
                  double heightModifier = widget.active ? (0.5 + 0.5 * phase) * _displayAmplitude : 0.0;
                  
                  double currentHeight = baseHeights[i] * (0.2 + heightModifier * 1.5);
                  currentHeight = currentHeight.clamp(4.0, 64.0);

                  return Container(
                    width: barWidth,
                    height: currentHeight,
                    margin: EdgeInsets.only(right: i < baseHeights.length - 1 ? gap : 0),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: widget.active ? 1.0 : 0.4),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  );
                }
              ),
          ],
        ),
      ),
    );
  }
}
