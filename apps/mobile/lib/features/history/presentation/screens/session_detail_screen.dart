import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/api/sessions_api_service.dart';
import '../../../../core/utils/verdict_utils.dart';
import '../../domain/models/saved_check.dart';


class SessionDetailScreen extends StatefulWidget {
  final String sessionId;

  const SessionDetailScreen({super.key, required this.sessionId});

  @override
  State<SessionDetailScreen> createState() => _SessionDetailScreenState();
}

class _SessionDetailScreenState extends State<SessionDetailScreen> {
  SessionDetail? _session;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api = SessionsApiService();
      final json = await api.getSession(widget.sessionId);
      final detail = SessionDetail.fromJson(json);
      if (mounted) {
        setState(() {
          _session = detail;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const BackButton(),
        title: const Text('Detalii sesiune'),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null || _session == null) {
      return Center(
        child: Text(_error ?? 'Sesiune negăsită'),
      );
    }

    final s = _session!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Session header
        AppFeatureCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    s.mode == 'recording' ? Icons.radio_button_checked_rounded : Icons.wifi_rounded,
                    size: 20,
                    color: AppColors.ink,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    s.mode == 'recording' ? 'Înregistrare' : 'Timp real',
                    style: AppTextStyles.labelMd.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${s.claimCount} ${s.claimCount == 1 ? 'afirmație verificată' : 'afirmații verificate'}',
                style: AppTextStyles.bodySm.copyWith(color: AppColors.mid),
              ),
              if (s.verdictSummary.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: s.verdictSummary.entries.map((e) {
                    final color = VerdictUtils.getColor(e.key);
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${e.value} ${VerdictUtils.translate(e.key)}',
                        style: AppTextStyles.labelSm.copyWith(
                          color: color,
                          fontWeight: FontWeight.w700,
                          fontSize: 11,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Claims list
        if (s.claims.isEmpty)
          const Padding(
            padding: EdgeInsets.all(24),
            child: Center(child: Text('Nicio afirmație în această sesiune.')),
          )
        else
          ...s.claims.map((claim) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: AppFeatureCard(
              padding: const EdgeInsets.all(16),
              child: InkWell(
                onTap: claim.verdict != null
                    ? () => context.push('/check/${claim.verdict!.id}')
                    : null,
                borderRadius: BorderRadius.circular(12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.only(top: 6),
                      decoration: BoxDecoration(
                        color: VerdictUtils.getColor(claim.verdict?.label ?? 'Unverified')
                            .withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Container(
                          width: 4,
                          height: 4,
                          decoration: BoxDecoration(
                            color: VerdictUtils.getColor(claim.verdict?.label ?? 'Unverified'),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            claim.text,
                            style: AppTextStyles.bodySm.copyWith(fontWeight: FontWeight.w500),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (claim.verdict != null) ...[
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: VerdictUtils.getColor(claim.verdict!.label).withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    VerdictUtils.translate(claim.verdict!.label),
                                    style: AppTextStyles.labelSm.copyWith(
                                      color: VerdictUtils.getColor(claim.verdict!.label),
                                      fontWeight: FontWeight.w600,
                                      fontSize: 9,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '${claim.verdict!.confidence.round()}%',
                                  style: AppTextStyles.labelSm.copyWith(color: AppColors.mid, fontSize: 9),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (claim.verdict != null)
                      const Icon(Icons.chevron_right, size: 16, color: AppColors.mid),
                  ],
                ),
              ),
            ),
          )),
      ],
    );
  }
}


