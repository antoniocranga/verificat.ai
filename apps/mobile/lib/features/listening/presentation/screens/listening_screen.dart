import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/widgets/widgets.dart';
import '../bloc/listening_bloc.dart';

class ListeningScreen extends StatefulWidget {
  const ListeningScreen({super.key});

  @override
  State<ListeningScreen> createState() => _ListeningScreenState();
}

class _ListeningScreenState extends State<ListeningScreen> {
  Timer? _uiTimer;
  int _displaySeconds = 0;

  @override
  void dispose() {
    _uiTimer?.cancel();
    super.dispose();
  }

  void _syncTimer(ListeningStatus status) {
    if (status == ListeningStatus.listening) {
      if (_uiTimer != null) return;
      _displaySeconds = 0;
      _uiTimer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (mounted) setState(() => _displaySeconds++);
      });
    } else {
      _uiTimer?.cancel();
      _uiTimer = null;
    }
  }

  String _formatTime(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verificare Audio'),
        centerTitle: true,
      ),
      body: BlocConsumer<ListeningBloc, ListeningState>(
        listener: (context, state) {
          _syncTimer(state.status);
          if (state.status == ListeningStatus.verdictReady) {
            _uiTimer?.cancel();
            _uiTimer = null;
          }
        },
        builder: (context, state) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildBody(context, state),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBody(BuildContext context, ListeningState state) {
    switch (state.status) {
      case ListeningStatus.idle:
        return _buildIdle(context);
      case ListeningStatus.listening:
        return _buildRecording(context);
      case ListeningStatus.processing:
        return _buildProcessing(context, state);
      case ListeningStatus.verdictReady:
        return _buildVerdict(context, state);
      case ListeningStatus.error:
        return _buildError(context, state);
    }
  }

  Widget _buildIdle(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(
          width: 64,
          height: 64,
          child: Icon(Icons.mic, size: 48, color: Color(0xFF8F8F8F)),
        ),
        const SizedBox(height: 24),
        Text(
          'Apăsați butonul pentru a începe verificarea',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: const Color(0xFF171717),
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        AppSmallPrimaryButton(
          label: 'Începe Verificarea',
          onPressed: () => context.read<ListeningBloc>().add(const StartListening()),
        ),
      ],
    );
  }

  Widget _buildRecording(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SoundWaveIndicator(active: true),
        const SizedBox(height: 24),
        Text(
          _formatTime(_displaySeconds),
          style: Theme.of(context).textTheme.displaySmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: const Color(0xFF171717),
            letterSpacing: -0.4,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Se înregistrează...',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF8F8F8F),
          ),
        ),
        const SizedBox(height: 32),
        AppSmallPrimaryButton(
          label: 'Oprește',
          foregroundColor: const Color(0xFFEE0000),
          onPressed: () => context.read<ListeningBloc>().add(const StopListening()),
        ),
      ],
    );
  }

  Widget _buildProcessing(BuildContext context, ListeningState state) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(
          width: 32,
          height: 32,
          child: CircularProgressIndicator(strokeWidth: 3),
        ),
        const SizedBox(height: 24),
        Text(
          'Se procesează...',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: const Color(0xFF171717),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Audio a fost trimis. Se analizează conținutul.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF8F8F8F),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildVerdict(BuildContext context, ListeningState state) {
    final claims = state.claimsData ?? [];
    final firstClaim = claims.isNotEmpty ? claims.first : null;

    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, size: 64, color: Color(0xFF22C55E)),
          const SizedBox(height: 16),
          Text(
            'Rezultatul este gata!',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: const Color(0xFF171717),
            ),
          ),
          if (firstClaim != null) ...[
            const SizedBox(height: 20),
            _buildClaimVerdict(context, firstClaim),
          ],
          if (claims.length > 1) ...[
            const SizedBox(height: 12),
            Text(
              '${claims.length} afirmații verificate',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: const Color(0xFF8F8F8F),
              ),
            ),
          ],
          const SizedBox(height: 24),
          AppSmallPrimaryButton(
            label: 'Verifică din nou',
            onPressed: () => context.read<ListeningBloc>().add(const ResetListening()),
          ),
        ],
      ),
    );
  }

  Widget _buildClaimVerdict(BuildContext context, Map<String, dynamic> claim) {
    const colors = <String, Color>{
      'True': Color(0xFF22C55E),
      'Mostly True': Color(0xFF84CC16),
      'Partially True': Color(0xFFD97706),
      'Misleading': Color(0xFFEA580C),
      'False': Color(0xFFEF4444),
      'Unverified': Color(0xFF6B7280),
    };

    final label = claim['verdict'] as String? ?? 'Unverified';
    final confidence = claim['confidenceScore'] as num? ?? 0;
    final explanation = claim['explanation'] as String? ?? '';
    final evidence = claim['evidence'] as List<dynamic>? ?? [];
    final color = colors[label] ?? const Color(0xFF171717);

    return AppFeatureCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: color.withValues(alpha: 0.25)),
              borderRadius: BorderRadius.circular(6),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            child: Text(
              label,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Nivel de încredere: $confidence / 100',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: const Color(0xFF4D4D4D),
            ),
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: confidence.toDouble() / 100,
              backgroundColor: const Color(0xFFEBEBEB),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 4,
            ),
          ),
          if (explanation.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              explanation,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF4D4D4D),
                height: 1.6,
              ),
            ),
          ],
          if (evidence.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              'Surse',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: const Color(0xFF171717),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            ...evidence.take(3).map((e) {
              final eMap = e as Map<String, dynamic>;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      eMap['title'] as String? ?? '',
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: const Color(0xFF171717),
                      ),
                    ),
                    if (eMap['url'] != null)
                      Text(
                        eMap['url'] as String,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: const Color(0xFF0070F3),
                        ),
                      ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _buildError(BuildContext context, ListeningState state) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.error, size: 64, color: Color(0xFFEE0000)),
        const SizedBox(height: 24),
        Text(
          'A apărut o eroare',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: const Color(0xFF171717),
          ),
        ),
        if (state.errorMessage != null) ...[
          const SizedBox(height: 12),
          Text(
            state.errorMessage!,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: const Color(0xFFEE0000),
            ),
            textAlign: TextAlign.center,
          ),
        ],
        const SizedBox(height: 32),
        AppSmallPrimaryButton(
          label: 'Încearcă din Nou',
          onPressed: () => context.read<ListeningBloc>().add(const StartListening()),
        ),
      ],
    );
  }

}
