import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/widgets/bottom_sheet_shell.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/entities/transcript_segment.dart';

class FactCheckBottomSheet extends StatelessWidget {
  final TranscriptSegment segment;

  const FactCheckBottomSheet({super.key, required this.segment});

  @override
  Widget build(BuildContext context) {
    final seg = segment;
    final fgColor = AppColors.streamingVerdictFg(seg.verdict);
    final bgColor = AppColors.streamingVerdictBg(seg.verdict);
    final confidence = seg.confidence ?? 0;

    return BottomSheetShell(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  color: AppColors.mid,
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
            ),

            // Verdict badge (immediate)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: fgColor.withValues(alpha: 0.3)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: fgColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      AppColors.streamingVerdictLabel(seg.verdict),
                      style: AppTextStyles.labelMd.copyWith(
                        color: fgColor,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Confidence score (animated after sheet opens)
            if (confidence > 0) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'NIVEL DE ÎNCREDERE',
                      style: AppTextStyles.labelCaps,
                    ),
                    const SizedBox(height: 8),
                    _ConfidenceBar(value: confidence),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Quoted claim
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                '"${seg.text}"',
                style: AppTextStyles.bodyMd.copyWith(
                  fontStyle: FontStyle.italic,
                  color: AppColors.mid,
                  height: 1.6,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Explanation (fade in only)
            if (seg.explanation != null && seg.explanation!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _FadeInSection(
                  child: Text(
                    seg.explanation!,
                    style: AppTextStyles.bodyMd.copyWith(height: 1.7),
                  ),
                ),
              ),

            // Matched fact
            if (seg.matchedFact != null && seg.matchedFact!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _FadeInSection(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.subtle,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('FAPT VERIFICAT', style: AppTextStyles.labelCaps),
                        const SizedBox(height: 6),
                        Text(
                          seg.matchedFact!,
                          style: AppTextStyles.bodyMd.copyWith(height: 1.65),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],

            // Sources
            if (seg.sources.isNotEmpty) ...[
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _FadeInSection(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('SURSE', style: AppTextStyles.labelCaps),
                      const SizedBox(height: 6),
                      ...seg.sources.map(
                        (s) => Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            s,
                            style: const TextStyle(
                              fontFamily: 'JetBrains Mono',
                              fontSize: 12,
                              color: AppColors.blue,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 24),
          ],
        ),
    );
  }
}

class _ConfidenceBar extends StatefulWidget {
  final double value;

  const _ConfidenceBar({required this.value});

  @override
  State<_ConfidenceBar> createState() => _ConfidenceBarState();
}

class _ConfidenceBarState extends State<_ConfidenceBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutQuint,
    );
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final clamped = widget.value.clamp(0.0, 1.0);
    final percent = (clamped * 100).round();
    final color = percent >= 70
        ? AppColors.verdictTrue
        : percent >= 40
            ? AppColors.verdictPartial
            : AppColors.verdictFalse;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedBuilder(
          animation: _animation,
          builder: (context, _) {
            return ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Container(
                height: 8,
                decoration: BoxDecoration(
                  color: AppColors.subtle,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: _animation.value * clamped,
                  child: Container(
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 4),
        AnimatedBuilder(
          animation: _animation,
          builder: (context, _) {
            return Text(
              '${(_animation.value * percent).round()}%',
              style: AppTextStyles.labelMd.copyWith(
                color: AppColors.ink,
                fontWeight: FontWeight.w600,
              ),
            );
          },
        ),
      ],
    );
  }
}

class _FadeInSection extends StatefulWidget {
  final Widget child;

  const _FadeInSection({required this.child});

  @override
  State<_FadeInSection> createState() => _FadeInSectionState();
}

class _FadeInSectionState extends State<_FadeInSection>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _opacity = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(opacity: _opacity, child: widget.child);
  }
}
