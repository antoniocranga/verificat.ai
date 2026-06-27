import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/entities/transcript_segment.dart';

/// Pill-shaped verdict badge using the streaming 4-value verdict system.
class StreamingVerdictBadge extends StatelessWidget {
  final StreamingVerdict? verdict;

  const StreamingVerdictBadge({super.key, this.verdict});

  @override
  Widget build(BuildContext context) {
    final label = AppColors.streamingVerdictLabel(verdict);
    if (label.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.streamingVerdictFg(verdict),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Text(
        label,
        style: AppTextStyles.labelCaps.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w700,
          fontSize: 9,
        ),
      ),
    );
  }
}
