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
                return _SessionItem(
                  session: check,
                  index: index,
                  disableAnimations: MediaQuery.of(context).disableAnimations,
                  onTap: () => context.push('/session/${check.id}'),
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

class _SessionItem extends StatefulWidget {
  final SavedCheck session;
  final int index;
  final bool disableAnimations;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _SessionItem({
    required this.session,
    required this.index,
    required this.disableAnimations,
    required this.onTap,
    required this.onDelete,
  });

  @override
  State<_SessionItem> createState() => _SessionItemState();
}

class _SessionItemState extends State<_SessionItem>
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

  String _formatDate(String? iso) {
    if (iso == null) return '';
    final dt = DateTime.tryParse(iso);
    if (dt == null) return iso;
    final months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];
    return '${dt.day} ${months[dt.month - 1]} ${dt.year}, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.session;
    final summary = s.verdictSummary ?? {};

    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(
        position: _slide,
        child: Dismissible(
          key: ValueKey(s.id),
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
                        color: s.mode == 'recording'
                            ? AppColors.verdictPartial.withValues(alpha: 0.1)
                            : AppColors.verdictTrue.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        s.mode == 'recording'
                            ? Icons.radio_button_checked_rounded
                            : Icons.wifi_rounded,
                        size: 20,
                        color: s.mode == 'recording'
                            ? AppColors.verdictPartial
                            : AppColors.verdictTrue,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _formatDate(s.startedAt),
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
                              Text(
                                '${s.claimCount ?? 0} ${(s.claimCount ?? 0) == 1 ? 'afirmație' : 'afirmații'}',
                                style: AppTextStyles.labelSm.copyWith(color: AppColors.mid),
                              ),
                              if (s.mode != null) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: AppColors.subtle,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    s.mode == 'recording' ? 'Înregistrare' : 'Timp real',
                                    style: AppTextStyles.labelSm.copyWith(
                                      fontSize: 9,
                                      color: AppColors.mid,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          if (summary.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 4,
                              runSpacing: 4,
                              children: summary.entries.map((e) {
                                final color = switch (e.key) {
                                  'true' => AppColors.verdictTrue,
                                  'false' => AppColors.verdictFalse,
                                  'uncertain' => AppColors.verdictPartial,
                                  _ => AppColors.mid,
                                };
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    '${e.value}',
                                    style: AppTextStyles.labelSm.copyWith(
                                      color: color,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 10,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
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
}
