import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/entities/transcript_segment.dart';

class SessionSummaryScreen extends StatelessWidget {
  final List<TranscriptSegment> segments;
  final String modeLabel;
  final VoidCallback onVerifyAgain;
  final bool disableAnimations;

  const SessionSummaryScreen({
    super.key,
    required this.segments,
    required this.modeLabel,
    required this.onVerifyAgain,
    this.disableAnimations = false,
  });

  @override
  Widget build(BuildContext context) {
    final claims = segments.where((s) => s.hasDisplayVerdict).toList();

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text('Rezumat sesiune'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeader(context, claims.length),

            const SizedBox(height: 24),

            // Claims
            if (claims.isEmpty)
              _buildNoClaims(context)
            else
              ...claims.map((c) => _ClaimCard(
                    segment: c,
                    disableAnimations: disableAnimations,
                  )),

            const SizedBox(height: 32),

            // Actions
            Row(
              children: [
                Expanded(
                  child: AppButton.secondary(
                    label: 'Verifică din nou',
                    onPressed: onVerifyAgain,
                  ),
                ),
                if (claims.isNotEmpty) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppButton.accent(
                      label: 'Trimite',
                      onPressed: () => _share(context, claims),
                    ),
                  ),
                ],
              ],
            ),

            const SizedBox(height: 16),

            Center(
              child: Text(
                'Salvat automat în Istoric',
                style: AppTextStyles.labelMd.copyWith(color: AppColors.mid),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, int claimsCount) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surfaceRaised,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.subtle),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: claimsCount > 0
                  ? AppColors.verdictTrue.withValues(alpha: 0.1)
                  : AppColors.subtle,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              claimsCount > 0 ? Icons.check_rounded : Icons.search_rounded,
              size: 24,
              color: claimsCount > 0 ? AppColors.verdictTrue : AppColors.mid,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  claimsCount > 0
                      ? '$claimsCount ${claimsCount == 1 ? 'afirmație verificată' : 'afirmații verificate'}'
                      : 'Nicio afirmație găsită',
                  style: AppTextStyles.labelLg.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 2),
                Text(
                  'Mod: $modeLabel',
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.mid),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoClaims(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Center(
        child: Text(
          'Nu am identificat nicio afirmație care să poată fi verificată.',
          style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  void _share(BuildContext context, List<TranscriptSegment> claims) {
    final buffer = StringBuffer();
    buffer.writeln('Rezumat verificat.xyz');
    buffer.writeln('Mod: $modeLabel');
    buffer.writeln('');
    for (final c in claims) {
      final label = AppColors.streamingVerdictLabel(c.verdict);
      buffer.writeln('[$label] ${c.text}');
      if (c.explanation != null) {
        buffer.writeln('  ${c.explanation}');
      }
      buffer.writeln('');
    }
    Clipboard.setData(ClipboardData(text: buffer.toString()));
    HapticFeedback.lightImpact();
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Rezumat copiat în clipboard'), duration: Duration(seconds: 2)),
      );
    }
  }
}

class _ClaimCard extends StatefulWidget {
  final TranscriptSegment segment;
  final bool disableAnimations;

  const _ClaimCard({required this.segment, this.disableAnimations = false});

  @override
  State<_ClaimCard> createState() => _ClaimCardState();
}

class _ClaimCardState extends State<_ClaimCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    final dur = widget.disableAnimations ? Duration.zero : const Duration(milliseconds: 300);
    _controller = AnimationController(vsync: this, duration: dur);
    _opacity = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    );
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final seg = widget.segment;
    final fgColor = AppColors.streamingVerdictFg(seg.verdict);

    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(
        position: _slide,
        child: Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: AppFeatureCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
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
                      style: AppTextStyles.labelCaps.copyWith(
                        color: fgColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (seg.confidence != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        '${(seg.confidence! * 100).round()}%',
                        style: AppTextStyles.labelSm.copyWith(color: AppColors.mid),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  seg.text,
                  style: AppTextStyles.bodyMd.copyWith(fontWeight: FontWeight.w500),
                ),
                if (seg.explanation != null && seg.explanation!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    seg.explanation!,
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.inkSub, height: 1.6),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
