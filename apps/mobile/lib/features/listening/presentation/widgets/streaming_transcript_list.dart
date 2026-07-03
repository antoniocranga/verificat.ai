import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/entities/transcript_segment.dart';
import 'fact_check_bottom_sheet.dart';

class StreamingTranscriptList extends StatefulWidget {
  final List<TranscriptSegment> segments;
  final String interimText;
  final bool disableAnimations;

  const StreamingTranscriptList({
    super.key,
    required this.segments,
    required this.interimText,
    this.disableAnimations = false,
  });

  @override
  State<StreamingTranscriptList> createState() => _StreamingTranscriptListState();
}

class _StreamingTranscriptListState extends State<StreamingTranscriptList> {
  final _scrollController = ScrollController();
  bool _userScrolling = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final atBottom = _scrollController.offset >=
        _scrollController.position.maxScrollExtent - 16;
    if (atBottom && _userScrolling) {
      setState(() => _userScrolling = false);
    } else if (!atBottom && !_userScrolling) {
      setState(() => _userScrolling = true);
    }
  }

  @override
  void didUpdateWidget(StreamingTranscriptList oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.segments.length < widget.segments.length ||
        oldWidget.interimText != widget.interimText) {
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_userScrolling || !_scrollController.hasClients) return;
      final dur = widget.disableAnimations
          ? Duration.zero
          : const Duration(milliseconds: 250);
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: dur,
        curve: Curves.easeOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasContent = widget.segments.isNotEmpty || widget.interimText.isNotEmpty;

    if (!hasContent) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 24),
          child: Text(
            'Vorbiți pentru a vedea transcrierea...',
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid),
          ),
        ),
      );
    }

    final itemCount =
        widget.segments.length + (widget.interimText.isNotEmpty ? 1 : 0);

    return ShaderMask(
      shaderCallback: (bounds) {
        return LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.transparent, Colors.black, Colors.black],
          stops: const [0.0, 0.12, 1.0],
        ).createShader(bounds);
      },
      blendMode: BlendMode.dstIn,
      child: Stack(
        children: [
          ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.fromLTRB(20, 60, 20, 120),
            itemCount: itemCount,
            itemBuilder: (context, index) {
              if (index == widget.segments.length) {
                return _InterimTextWidget(
                  text: widget.interimText,
                  disableAnimations: widget.disableAnimations,
                );
              }
              return _AnimatedSegmentWidget(
                key: ValueKey(widget.segments[index].segmentId),
                segment: widget.segments[index],
                disableAnimations: widget.disableAnimations,
              );
            },
          ),
          if (_userScrolling)
            Positioned(
              bottom: 100,
              right: 20,
              child: FloatingActionButton.small(
                heroTag: 'transcript-scroll',
                backgroundColor: AppColors.accent,
                onPressed: () {
                  setState(() => _userScrolling = false);
                  _scrollToBottom();
                },
                child: const Icon(Icons.arrow_downward, color: Colors.white, size: 18),
              ),
            ),
        ],
      ),
    );
  }
}

class _InterimTextWidget extends StatelessWidget {
  final String text;
  final bool disableAnimations;

  const _InterimTextWidget({required this.text, this.disableAnimations = false});

  @override
  Widget build(BuildContext context) {
    final words = text.split(' ');
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: SelectableText.rich(
        TextSpan(
          children: [
            for (var i = 0; i < words.length; i++)
              WidgetSpan(
                child: _WordFadeIn(
                  word: '${words[i]}${i < words.length - 1 ? ' ' : ''}',
                  delay: disableAnimations ? Duration.zero : Duration(milliseconds: (i * 20).clamp(0, 200)),
                  disableAnimations: disableAnimations,
                  style: AppTextStyles.bodyMd.copyWith(
                    color: AppColors.mid,
                    fontStyle: FontStyle.italic,
                    fontSize: 16,
                    height: 1.6,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _AnimatedSegmentWidget extends StatefulWidget {
  final TranscriptSegment segment;
  final bool disableAnimations;

  const _AnimatedSegmentWidget({
    super.key,
    required this.segment,
    this.disableAnimations = false,
  });

  @override
  State<_AnimatedSegmentWidget> createState() => _AnimatedSegmentWidgetState();
}

class _AnimatedSegmentWidgetState extends State<_AnimatedSegmentWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _appearController;
  late Animation<double> _opacity;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _appearController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _opacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _appearController, curve: Curves.easeOutCubic),
    );
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _appearController, curve: Curves.easeOutCubic));
    _appearController.forward();
  }

  @override
  void dispose() {
    _appearController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final seg = widget.segment;
    final highlighted = seg.hasDisplayVerdict;
    final text = seg.text;

    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(
        position: _slide,
        child: GestureDetector(
          onTap: highlighted
              ? () {
                  HapticFeedback.lightImpact();
                  showModalBottomSheet(
                    context: context,
                    backgroundColor: Colors.transparent,
                    isScrollControlled: true,
                    useSafeArea: true,
                    builder: (_) => FactCheckBottomSheet(segment: seg),
                  );
                }
              : null,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: highlighted
                ? _HighlightedSegment(segment: seg)
                : Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Text(
                      text,
                      style: AppTextStyles.bodyLg,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}

class _HighlightedSegment extends StatefulWidget {
  final TranscriptSegment segment;

  const _HighlightedSegment({required this.segment});

  @override
  State<_HighlightedSegment> createState() => _HighlightedSegmentState();
}

class _HighlightedSegmentState extends State<_HighlightedSegment>
    with SingleTickerProviderStateMixin {
  late AnimationController _highlightController;
  late Animation<double> _opacity;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _highlightController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _opacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _highlightController, curve: Curves.easeOut),
    );
    _scale = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.03), weight: 1),
      TweenSequenceItem(tween: Tween(begin: 1.03, end: 1.0), weight: 1),
    ]).animate(CurvedAnimation(parent: _highlightController, curve: Curves.easeOut));
    _highlightController.forward();

    final v = widget.segment.verdict;
    if (v == StreamingVerdict.falso) {
      HapticFeedback.heavyImpact();
    } else {
      HapticFeedback.lightImpact();
    }
  }

  @override
  void dispose() {
    _highlightController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final seg = widget.segment;
    final bgColor = AppColors.streamingVerdictBg(seg.verdict);
    final fgColor = AppColors.streamingVerdictFg(seg.verdict);

    return AnimatedBuilder(
      animation: _highlightController,
      builder: (context, child) {
        return Transform.scale(
          scale: _scale.value,
          child: Opacity(
            opacity: _opacity.value,
            child: Container(
              padding: const EdgeInsets.fromLTRB(12, 6, 12, 6),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(6),
                border: Border(
                  bottom: BorderSide(color: fgColor, width: 2),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    seg.text,
                    style: AppTextStyles.bodyLg,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      _VerdictLabel(verdict: seg.verdict),
                      const SizedBox(width: 8),
                      Icon(Icons.info_outline, size: 14, color: fgColor),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _VerdictLabel extends StatelessWidget {
  final StreamingVerdict? verdict;

  const _VerdictLabel({required this.verdict});

  @override
  Widget build(BuildContext context) {
    final label = AppColors.streamingVerdictLabel(verdict);
    final color = AppColors.streamingVerdictFg(verdict);
    return Text(
      label,
      style: AppTextStyles.labelCaps.copyWith(
        color: color,
        fontWeight: FontWeight.w700,
        fontSize: 10,
      ),
    );
  }
}

class _WordFadeIn extends StatefulWidget {
  final String word;
  final Duration delay;
  final bool disableAnimations;
  final TextStyle style;

  const _WordFadeIn({
    required this.word,
    required this.delay,
    this.disableAnimations = false,
    required this.style,
  });

  @override
  State<_WordFadeIn> createState() => _WordFadeInState();
}

class _WordFadeInState extends State<_WordFadeIn>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    final dur = widget.disableAnimations ? Duration.zero : const Duration(milliseconds: 150);
    _controller = AnimationController(vsync: this, duration: dur);
    _opacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    Future.delayed(widget.delay, () {
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
    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(
        position: _slide,
        child: Text(widget.word, style: widget.style),
      ),
    );
  }
}
