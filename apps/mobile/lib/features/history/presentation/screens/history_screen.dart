import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/models/saved_check.dart';
import '../bloc/saved_checks_bloc.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Istoric'),
        centerTitle: true,
      ),
      body: BlocBuilder<SavedChecksBloc, SavedChecksState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.error != null) {
            return AppEmptyState(
              type: AppEmptyStateType.error,
              icon: Icons.error_outline_rounded,
              title: 'Eroare',
              description: state.error!,
              actionLabel: 'Reîncearcă',
              onAction: () => context.read<SavedChecksBloc>().add(const SavedChecksLoaded()),
            );
          }
          if (state.checks.isEmpty) {
            return const AppEmptyState(
              type: AppEmptyStateType.empty,
              icon: Icons.history_rounded,
              title: 'Nicio sesiune salvată',
              description: 'Sesiunile de verificare vor apărea aici automat după ce folosești aplicația.',
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              HapticFeedback.lightImpact();
              context.read<SavedChecksBloc>().add(const SavedChecksLoaded());
            },
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              itemCount: state.checks.length,
              itemBuilder: (context, index) {
                final check = state.checks[index];
                return _HistoryItem(
                  check: check,
                  index: index,
                  disableAnimations: MediaQuery.of(context).disableAnimations,
                  onTap: () => context.push('/check/${check.id}'),
                  onDelete: () {
                    context.read<SavedChecksBloc>().add(CheckRemoved(check.id));
                    HapticFeedback.lightImpact();
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _HistoryItem extends StatefulWidget {
  final SavedCheck check;
  final int index;
  final bool disableAnimations;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _HistoryItem({
    required this.check,
    required this.index,
    required this.disableAnimations,
    required this.onTap,
    required this.onDelete,
  });

  @override
  State<_HistoryItem> createState() => _HistoryItemState();
}

class _HistoryItemState extends State<_HistoryItem>
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
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    Future.delayed(Duration(milliseconds: (widget.index * 20).clamp(0, 200)), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color _verdictColor(String? verdict) {
    return switch (verdict) {
      'True' => AppColors.verdictTrue,
      'False' => AppColors.verdictFalse,
      'Mostly True' => AppColors.verdictMostlyTrue,
      'Partially True' => AppColors.verdictPartial,
      'Misleading' => AppColors.verdictMisleading,
      _ => AppColors.mid,
    };
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(
        position: _slide,
        child: Dismissible(
          key: ValueKey(widget.check.id),
          direction: DismissDirection.endToStart,
          onDismissed: (_) => widget.onDelete(),
          background: Container(
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.only(right: 20),
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: AppColors.error.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
          ),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: AppFeatureCard(
              padding: const EdgeInsets.all(16),
              child: InkWell(
                onTap: widget.onTap,
                borderRadius: BorderRadius.circular(12),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: _verdictColor(widget.check.verdict).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _verdictIcon(widget.check.verdict),
                        size: 20,
                        color: _verdictColor(widget.check.verdict),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.check.claimText ?? 'Verificare #${widget.check.id.substring(0, 8)}',
                            style: AppTextStyles.labelMd.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.ink,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              if (widget.check.verdict != null) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: _verdictColor(widget.check.verdict).withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    widget.check.verdict!,
                                    style: AppTextStyles.labelSm.copyWith(
                                      color: _verdictColor(widget.check.verdict),
                                      fontWeight: FontWeight.w600,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                                if (widget.check.confidenceScore != null) ...[
                                  const SizedBox(width: 6),
                                  Text(
                                    '${widget.check.confidenceScore!.toStringAsFixed(0)}%',
                                    style: AppTextStyles.labelSm.copyWith(color: AppColors.mid),
                                  ),
                                ],
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, size: 18, color: AppColors.mid),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  IconData _verdictIcon(String? verdict) {
    return switch (verdict) {
      'True' => Icons.check_circle_rounded,
      'Mostly True' => Icons.check_circle_outline_rounded,
      'Partially True' => Icons.info_rounded,
      'Misleading' => Icons.warning_amber_rounded,
      'False' => Icons.cancel_rounded,
      _ => Icons.help_rounded,
    };
  }
}
