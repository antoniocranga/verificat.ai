import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/entities/transcript_segment.dart';
import 'verdict_badge.dart';

/// Bottom sheet showing the full fact-check result for a transcript segment.
/// Opened by tapping a highlighted segment in the transcript view.
class ExplanationSheet extends StatelessWidget {
  final TranscriptSegment segment;

  const ExplanationSheet({super.key, required this.segment});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 24),
      decoration: const BoxDecoration(
        color: AppColors.canvas,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        boxShadow: [
          BoxShadow(color: Color(0x33000000), blurRadius: 20),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 16),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.mid,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Verdict + confidence row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    StreamingVerdictBadge(verdict: segment.verdict),
                    if (segment.confidence != null) ...[
                      const SizedBox(width: 10),
                      Text(
                        '${(segment.confidence! * 100).round()}% încredere',
                        style: AppTextStyles.labelMd.copyWith(
                          color: AppColors.mid,
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Quoted claim
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  '"${segment.text}"',
                  style: AppTextStyles.bodyMd.copyWith(
                    fontStyle: FontStyle.italic,
                    color: AppColors.mid,
                    height: 1.6,
                  ),
                ),
              ),

              // Explanation
              if (segment.explanation != null && segment.explanation!.isNotEmpty) ...[
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    segment.explanation!,
                    style: AppTextStyles.bodyMd.copyWith(height: 1.7),
                  ),
                ),
              ],

              // Matched fact box
              if (segment.matchedFact != null && segment.matchedFact!.isNotEmpty) ...[
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.subtle,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'FAPT VERIFICAT',
                          style: AppTextStyles.labelCaps,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          segment.matchedFact!,
                          style: AppTextStyles.bodyMd.copyWith(height: 1.65),
                        ),
                      ],
                    ),
                  ),
                ),
              ],

              // Sources
              if (segment.sources.isNotEmpty) ...[
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('SURSE', style: AppTextStyles.labelCaps),
                      const SizedBox(height: 6),
                      ...segment.sources.map(
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
              ],

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
