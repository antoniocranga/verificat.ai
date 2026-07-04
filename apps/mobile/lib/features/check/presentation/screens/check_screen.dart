import 'package:flutter/material.dart';
import '../../../../core/utils/verdict_utils.dart';
import '../../../../core/widgets/widgets.dart';
import '../../data/repositories/verdict_repository_impl.dart';
import '../../domain/entities/verdict.dart';
import '../../domain/repositories/verdict_repository.dart';

class CheckScreen extends StatefulWidget {
  final String verdictId;

  const CheckScreen({super.key, required this.verdictId});

  @override
  State<CheckScreen> createState() => _CheckScreenState();
}

class _CheckScreenState extends State<CheckScreen> {
  final VerdictRepository _repository = VerdictRepositoryImpl();
  Verdict? _verdict;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadVerdict();
  }

  Future<void> _loadVerdict() async {
    try {
      final verdict = await _repository.getVerdict(widget.verdictId);
      setState(() {
        _verdict = verdict;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const BackButton(),
        title: const Text('Rezultat Verificare'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: _buildBody(context),
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null || _verdict == null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _error ?? 'Verdict negăsit',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Verdictul căutat nu există sau nu este accesibil public.',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant),
          ),
        ],
      );
    }

    final verdict = _verdict!;
    final accentColor = VerdictUtils.getColor(verdict.label);
    final translatedLabel = VerdictUtils.translate(verdict.label);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Sesiune: ${verdict.sessionId}',
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 16),
          AppFeatureCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  decoration: BoxDecoration(
                    border:
                        Border.all(color: accentColor.withValues(alpha: 0.25)),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  child: Text(
                    translatedLabel,
                    style: Theme.of(context)
                        .textTheme
                        .headlineMedium
                        ?.copyWith(color: accentColor),
                  ),
                ),
                const SizedBox(height: 8),
                Text('Nivel de încredere: ${verdict.confidence} / 100',
                    style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 8),
                Text(verdict.explanation,
                    style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: LinearProgressIndicator(
                    value: verdict.confidence / 100,
                    valueColor: AlwaysStoppedAnimation<Color>(accentColor),
                    minHeight: 4,
                  ),
                ),
              ],
            ),
          ),
          if (verdict.sources.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text(
              'Surse',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 12),
            ...verdict.sources.map(
              (source) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: AppFeatureCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(source.title,
                          style: Theme.of(context).textTheme.labelLarge),
                      const SizedBox(height: 4),
                      Text(
                        source.url,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      const SizedBox(height: 4),
                      Text('Scor de încredere: ${source.trustScore} / 100',
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
