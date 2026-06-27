import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/services/transcript_stream_service.dart';
import '../../domain/entities/transcript_segment.dart';
import 'verdict_badge.dart';
import 'explanation_sheet.dart';

/// Scrollable real-time transcript view.
///
/// Behaviours:
/// - New segments auto-scroll to bottom
/// - Top-gradient fade makes older text "fade into the past"
/// - Manual scroll up pauses auto-scroll; scroll back to bottom resumes it
/// - Committed segments animate to verdict colour on fact-check result
/// - Tapping a highlighted segment opens [ExplanationSheet]
/// - Interim (unconfirmed) text is shown below committed segments in italic gray
class TranscriptView extends StatefulWidget {
  const TranscriptView({super.key});

  @override
  State<TranscriptView> createState() => _TranscriptViewState();
}

class _TranscriptViewState extends State<TranscriptView> {
  final _scrollController = ScrollController();
  bool _userScrolling = false;
  static const double _fadeHeight = 80.0;
  static const double _atBottomThreshold = 16.0;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final atBottom = _scrollController.offset >=
        _scrollController.position.maxScrollExtent - _atBottomThreshold;
    if (atBottom && _userScrolling) {
      setState(() => _userScrolling = false);
    } else if (!atBottom && !_userScrolling) {
      setState(() => _userScrolling = true);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_userScrolling || !_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TranscriptStreamService>(
      builder: (context, service, _) {
        _scrollToBottom();

        final itemCount =
            service.segments.length + (service.interimText.isNotEmpty ? 1 : 0);

        return Stack(
          children: [
            // ── Transcript list ─────────────────────────────────────────────
            ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(20, 80, 20, 120),
              itemCount: itemCount,
              itemBuilder: (context, index) {
                // Last item is the interim text placeholder
                if (index == service.segments.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      service.interimText,
                      style: AppTextStyles.bodyMd.copyWith(
                        color: AppColors.mid,
                        fontStyle: FontStyle.italic,
                        fontSize: 16,
                        height: 1.6,
                      ),
                    ),
                  );
                }
                return _SegmentTile(segment: service.segments[index]);
              },
            ),

            // ── Top gradient fade ─────────────────────────────────────────
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: _fadeHeight,
              child: IgnorePointer(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [AppColors.canvas, Color(0x00FAF9F5)],
                    ),
                  ),
                ),
              ),
            ),

            // ── Scroll-to-bottom FAB ──────────────────────────────────────
            if (_userScrolling)
              Positioned(
                bottom: 100,
                right: 20,
                child: FloatingActionButton.small(
                  heroTag: 'transcript-scroll-fab',
                  backgroundColor: AppColors.accent,
                  onPressed: () {
                    setState(() => _userScrolling = false);
                    _scrollToBottom();
                  },
                  child: const Icon(
                    Icons.arrow_downward,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/// A single committed transcript segment, colour-coded by verdict.
class _SegmentTile extends StatelessWidget {
  final TranscriptSegment segment;

  const _SegmentTile({required this.segment});

  @override
  Widget build(BuildContext context) {
    final highlighted = segment.hasDisplayVerdict;

    return GestureDetector(
      onTap: highlighted ? () => _showExplanation(context) : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOut,
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: EdgeInsets.fromLTRB(highlighted ? 12 : 0, 6, 8, 6),
        decoration: BoxDecoration(
          color: AppColors.streamingVerdictBg(segment.verdict),
          borderRadius: BorderRadius.circular(4),
          border: highlighted
              ? Border(
                  left: BorderSide(
                    color: AppColors.streamingVerdictFg(segment.verdict),
                    width: 3,
                  ),
                )
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              segment.text,
              style: AppTextStyles.bodyLg,
            ),
            if (highlighted)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Row(
                  children: [
                    StreamingVerdictBadge(verdict: segment.verdict),
                    const SizedBox(width: 6),
                    Icon(
                      Icons.info_outline,
                      size: 14,
                      color: AppColors.streamingVerdictFg(segment.verdict),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _showExplanation(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => ExplanationSheet(segment: segment),
    );
  }
}
