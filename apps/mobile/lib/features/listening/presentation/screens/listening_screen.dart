import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/entities/transcript_segment.dart';
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
    if (status == ListeningStatus.listening || status == ListeningStatus.streaming) {
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
      backgroundColor: AppColors.canvas,
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
              child: _buildBody(context, state),
            ),
          );
        },
      ),
      floatingActionButton: BlocBuilder<ListeningBloc, ListeningState>(
        builder: (context, state) {
          if (state.status == ListeningStatus.streaming || state.status == ListeningStatus.listening) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 100.0),
              child: FloatingActionButton.extended(
                onPressed: () {
                  if (state.status == ListeningStatus.streaming) {
                    context.read<ListeningBloc>().add(const StopStreaming());
                  } else {
                    context.read<ListeningBloc>().add(const StopListening());
                  }
                },
                backgroundColor: AppColors.ink,
                foregroundColor: AppColors.surfaceRaised,
                icon: const Icon(Icons.stop_rounded),
                label: const Text('Oprește', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildBody(BuildContext context, ListeningState state) {
    return switch (state.status) {
      ListeningStatus.idle        => _buildIdle(context),
      ListeningStatus.listening   => _buildRecording(context, state),
      ListeningStatus.streaming   => _buildStreaming(context, state),
      ListeningStatus.processing  => _buildProcessing(context, state),
      ListeningStatus.transcriptionReady => _buildTranscriptionEdit(context, state),
      ListeningStatus.verdictReady => _buildVerdict(context, state),
      ListeningStatus.error       => _buildError(context, state),
    };
  }

  Widget _buildIdle(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.subtle.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.mic_none_rounded, size: 28, color: AppColors.mid),
            ),
            const SizedBox(height: 20),
            Text(
              'Pregătit pentru verificare',
              style: AppTextStyles.headingSubsection.copyWith(fontSize: 16, letterSpacing: -0.3),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 280),
              child: Text(
                'Alege modul de captură audio pentru a verifica afirmațiile.',
                style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid, height: 1.65),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 24),
            AppButton.primary(
              label: 'Înregistrare Audio',
              onPressed: () => context.read<ListeningBloc>().add(const StartListening()),
              width: null,
            ),
            const SizedBox(height: 12),
            AppButton.secondary(
              label: 'Flux în Timp Real',
              onPressed: () => context.read<ListeningBloc>().add(const StartStreaming()),
              width: null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecording(BuildContext context, ListeningState state) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SoundWaveIndicator(
          active: true,
          amplitudeStream: context.read<ListeningBloc>().amplitudeStream,
        ),
        const SizedBox(height: 24),
        Text(
          _formatTime(_displaySeconds),
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 36,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
            letterSpacing: -0.72,
            fontFeatures: [FontFeature.tabularFigures()],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Se înregistrează...',
          style: AppTextStyles.labelMd.copyWith(color: AppColors.mid),
        ),
      ],
    );
  }

  Widget _buildStreaming(BuildContext context, ListeningState state) {
    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SoundWaveIndicator(
            active: true,
            amplitudeStream: context.read<ListeningBloc>().amplitudeStream,
          ),
          const SizedBox(height: 16),
          Text(
            _formatTime(_displaySeconds),
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 36,
              fontWeight: FontWeight.w700,
              color: AppColors.ink,
              letterSpacing: -0.72,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Ascultare în timp real...',
            style: AppTextStyles.labelMd.copyWith(color: AppColors.mid),
          ),
          const SizedBox(height: 16),

          if (state.segments.isNotEmpty)
            ...state.segments.map((seg) => _buildSegmentCard(seg)),

          if (state.interimText.isNotEmpty)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceRaised,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.subtle),
              ),
              child: Text(
                state.interimText,
                style: AppTextStyles.bodyMd.copyWith(
                  color: AppColors.mid,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),

          if (state.segments.isEmpty && state.interimText.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Text(
                'Vorbiți pentru a vedea transcrierea...',
                style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid),
              ),
            ),
          const SizedBox(height: 80), // extra padding for fab
        ],
      ),
    );
  }

  Widget _buildSegmentCard(TranscriptSegment seg) {
    Color verdictColor;
    IconData verdictIcon;
    String verdictLabel;

    switch (seg.verdict) {
      case StreamingVerdict.verdadero:
        verdictColor = AppColors.verdictTrue;
        verdictIcon = Icons.check_circle;
        verdictLabel = 'Adevărat';
      case StreamingVerdict.falso:
        verdictColor = AppColors.verdictFalse;
        verdictIcon = Icons.cancel;
        verdictLabel = 'Fals';
      case StreamingVerdict.uncertain:
        verdictColor = AppColors.verdictPartial;
        verdictIcon = Icons.help;
        verdictLabel = 'Incert';
      case StreamingVerdict.unverified:
        verdictColor = AppColors.mid;
        verdictIcon = Icons.hourglass_empty;
        verdictLabel = 'Neverificat';
      case null:
        verdictColor = AppColors.mid;
        verdictIcon = Icons.pending;
        verdictLabel = 'În așteptare...';
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceRaised,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(verdictIcon, size: 18, color: verdictColor),
              const SizedBox(width: 6),
              Text(
                verdictLabel,
                style: AppTextStyles.labelMd.copyWith(
                  color: verdictColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            seg.text,
            style: AppTextStyles.bodyMd.copyWith(color: AppColors.ink),
          ),
          if (seg.explanation != null && seg.explanation!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              seg.explanation!,
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.inkSub,
                fontSize: 13,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildProcessing(BuildContext context, ListeningState state) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Se procesează...',
          style: AppTextStyles.headingSubsection,
        ),
        const SizedBox(height: 8),
        Text(
          'Audio a fost trimis. Se analizează conținutul.',
          style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid),
        ),
        const SizedBox(height: 24),
        const AppFeatureCard(
          padding: EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonText(lines: 1),
              SizedBox(height: 16),
              SkeletonText(lines: 3),
              SizedBox(height: 24),
              SkeletonText(lines: 2),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTranscriptionEdit(BuildContext context, ListeningState state) {
    return _TranscriptionEditWidget(
      initialText: state.transcript ?? '',
      onCancel: () => context.read<ListeningBloc>().add(const ResetListening()),
      onSubmit: (text) => context.read<ListeningBloc>().add(SubmitTranscription(text)),
    );
  }

  Widget _buildVerdict(BuildContext context, ListeningState state) {
    final claims = state.claimsData ?? [];
    final firstClaim = claims.isNotEmpty ? claims.first : null;

    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.verdictTrue.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.check_rounded,
              size: 32,
              color: AppColors.verdictTrue,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            claims.isEmpty ? 'Nicio afirmație găsită' : 'Rezultatul este gata!', 
            style: AppTextStyles.headingSubsection,
          ),
          if (claims.isEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'Nu am identificat nicio afirmație care să poată fi verificată.',
              style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid),
              textAlign: TextAlign.center,
            ),
          ],
          if (firstClaim != null) ...[
            const SizedBox(height: 24),
            _buildClaimVerdict(context, firstClaim),
          ],
          if (claims.length > 1) ...[
            const SizedBox(height: 12),
            Text(
              '${claims.length} afirmații verificate',
              style: AppTextStyles.labelMd.copyWith(color: AppColors.mid),
            ),
          ],
          const SizedBox(height: 24),
          AppButton.secondary(
            label: 'Verifică din nou',
            onPressed: () =>
                context.read<ListeningBloc>().add(const ResetListening()),
          ),
        ],
      ),
    );
  }

  Widget _buildClaimVerdict(
      BuildContext context, Map<String, dynamic> claim) {
    final label = claim['verdict'] as String? ?? 'Unverified';
    final confidence = claim['confidenceScore'] as num? ?? 0;
    final explanation = claim['explanation'] as String? ?? '';
    final evidence = claim['evidence'] as List<dynamic>? ?? [];
    final color = AppColors.forVerdict(label);

    return AppFeatureCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: color.withValues(alpha: 0.2)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      label.toUpperCase(),
                      style: AppTextStyles.labelMd.copyWith(
                        color: color,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              if (confidence > 0)
                Text(
                  '$confidence% Confident',
                  style: AppTextStyles.labelMd.copyWith(
                    color: AppColors.inkSub,
                    fontWeight: FontWeight.w600,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            claim['claim'] as String? ?? 'Afirmație necunoscută',
            style: AppTextStyles.headingSubsection.copyWith(
              color: AppColors.ink,
              fontSize: 18,
            ),
          ),
          if (explanation.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              explanation,
              style: AppTextStyles.bodyMd.copyWith(
                color: AppColors.inkSub,
                height: 1.65,
              ),
            ),
          ],
          if (evidence.isNotEmpty) ...[
            const SizedBox(height: 24),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.only(top: 16),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: AppColors.subtle),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'SURSE',
                    style: AppTextStyles.labelSm.copyWith(
                      color: AppColors.mid,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...evidence.take(3).map((e) {
                    final eMap = e as Map<String, dynamic>;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            eMap['title'] as String? ?? 'Sursă',
                            style: AppTextStyles.bodyMd.copyWith(
                              color: AppColors.ink,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          if (eMap['url'] != null)
                            Text(
                              eMap['url'] as String,
                              style: AppTextStyles.bodySm.copyWith(
                                color: AppColors.mid,
                                decoration: TextDecoration.underline,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildError(BuildContext context, ListeningState state) {
    return AppEmptyState(
      type: AppEmptyStateType.error,
      icon: Icons.error_outline_rounded,
      title: 'A apărut o eroare',
      description: state.errorMessage ??
          'Nu am putut procesa audio-ul. Vă rugăm să încercați din nou.',
      actionLabel: 'Încearcă din Nou',
      onAction: () =>
          context.read<ListeningBloc>().add(const StartListening()),
    );
  }
}

class _TranscriptionEditWidget extends StatefulWidget {
  final String initialText;
  final VoidCallback onCancel;
  final ValueChanged<String> onSubmit;

  const _TranscriptionEditWidget({
    required this.initialText,
    required this.onCancel,
    required this.onSubmit,
  });

  @override
  State<_TranscriptionEditWidget> createState() => _TranscriptionEditWidgetState();
}

class _TranscriptionEditWidgetState extends State<_TranscriptionEditWidget> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialText);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Verifică textul',
          style: AppTextStyles.headingSubsection,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'Acesta este textul detectat. Îl poți edita înainte de a-l trimite pentru verificare.',
          style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _controller,
          maxLines: 6,
          minLines: 3,
          decoration: InputDecoration(
            hintText: 'Textul transcris va apărea aici...',
            filled: true,
            fillColor: AppColors.surfaceRaised,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.subtle),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.subtle),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.accent),
            ),
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: AppButton.secondary(
                label: 'Anulează',
                onPressed: widget.onCancel,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: AppButton.primary(
                label: 'Trimite',
                onPressed: () => widget.onSubmit(_controller.text),
              ),
            ),
          ],
        ),
      ],
    );
  }
}