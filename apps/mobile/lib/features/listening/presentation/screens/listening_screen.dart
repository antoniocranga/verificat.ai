import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../bloc/listening_bloc.dart';
import '../widgets/streaming_transcript_list.dart';
import '../widgets/session_summary_screen.dart';
import '../widgets/tutorial_overlay.dart';

class ListeningScreen extends StatefulWidget {
  const ListeningScreen({super.key});

  @override
  State<ListeningScreen> createState() => _ListeningScreenState();
}

class _ListeningScreenState extends State<ListeningScreen> {
  Timer? _uiTimer;
  int _displaySeconds = 0;
  bool _showTutorial = false;

  @override
  void initState() {
    super.initState();
    _checkTutorial();
    _loadDefaultMode();
  }

  Future<void> _checkTutorial() async {
    final prefs = await SharedPreferences.getInstance();
    final tutorialShown = prefs.getBool('tutorial-shown') ?? false;
    if (mounted && !tutorialShown) {
      setState(() => _showTutorial = true);
    }
  }

  Future<void> _loadDefaultMode() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('default-listen-mode');
    final mode =
        saved == 'recording' ? ListenMode.recording : ListenMode.streaming;
    if (mounted) {
      context.read<ListeningBloc>().add(SetListenMode(mode));
    }
  }

  @override
  void dispose() {
    _uiTimer?.cancel();
    super.dispose();
  }

  void _syncTimer(ListeningStatus status) {
    if (status == ListeningStatus.listening ||
        status == ListeningStatus.streaming) {
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
    final disableAnimations = MediaQuery.of(context).disableAnimations;

    final screen = BlocConsumer<ListeningBloc, ListeningState>(
      listener: (context, state) {
        _syncTimer(state.status);
        if (state.status == ListeningStatus.verdictReady) {
          _uiTimer?.cancel();
          _uiTimer = null;
        }
      },
      builder: (context, state) {
        if (state.status == ListeningStatus.verdictReady) {
          return SessionSummaryScreen(
            segments: state.segments,
            modeLabel: state.listenMode == ListenMode.streaming
                ? 'Timp real'
                : 'Înregistrare',
            disableAnimations: disableAnimations,
            onVerifyAgain: () {
              context.read<ListeningBloc>().add(const ResetListening());
            },
          );
        }

        final showStop = state.status == ListeningStatus.streaming ||
            state.status == ListeningStatus.listening;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Ascultă'),
            centerTitle: true,
          ),
          body: Column(
            children: [
              if (state.status == ListeningStatus.idle ||
                  state.status == ListeningStatus.error)
                _buildModeSwitch(context, state),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  switchInCurve: Curves.easeOut,
                  switchOutCurve: Curves.easeIn,
                  child: SizedBox(
                    key: ValueKey(state.status),
                    child: _buildContent(context, state, disableAnimations),
                  ),
                ),
              ),
            ],
          ),
          floatingActionButtonLocation: const _AboveBottomNavFabLocation(),
          floatingActionButton: showStop
              ? Builder(
                  builder: (context) {
                    final cs = Theme.of(context).colorScheme;
                    return FloatingActionButton(
                      heroTag: 'stop-fab',
                      backgroundColor: cs.error,
                      foregroundColor: cs.onError,
                      onPressed: () {
                        HapticFeedback.mediumImpact();
                        if (state.status == ListeningStatus.streaming) {
                          context.read<ListeningBloc>().add(const StopStreaming());
                        } else {
                          context.read<ListeningBloc>().add(const StopListening());
                        }
                      },
                      child: const Icon(Icons.stop_rounded),
                    );
                  },
                )
              : null,
        );
      },
    );

    if (_showTutorial) {
      return TutorialOverlay(
        child: screen,
        onDismissed: () {
          if (mounted) setState(() => _showTutorial = false);
        },
      );
    }

    return screen;
  }

  // Replaces the earlier segmented-control design (see §3.3 of the original spec).
  // SelectorTrigger is preferred — it stays legible at all widths and uses the
  // shared bottom-sheet pattern consistent with the rest of the UI.
  Widget _buildModeSwitch(BuildContext context, ListeningState state) {
    final isActive = state.status == ListeningStatus.streaming ||
        state.status == ListeningStatus.listening;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: AppSurface(
        elevation: AppSurfaceElevation.raised,
        borderRadius: 12,
        padding: EdgeInsets.zero,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SelectorTrigger<ListenMode>(
              title: 'Mod',
              currentValue: state.listenMode,
              disabled: isActive,
              options: const [
                SelectorOption(
                  value: ListenMode.streaming,
                  label: 'Timp real',
                  icon: Icons.wifi_rounded,
                  subtitle: 'Verificare în timp ce vorbești',
                ),
                SelectorOption(
                  value: ListenMode.recording,
                  label: 'Înregistrare',
                  icon: Icons.radio_button_checked_rounded,
                  subtitle: 'Înregistrează și trimite',
                ),
              ],
              onChanged: (mode) {
                context.read<ListeningBloc>().add(SetListenMode(mode));
                _saveDefaultMode(
                    mode == ListenMode.streaming ? 'streaming' : 'recording');
              },
            ),
            if (isActive)
              const Padding(
                padding: EdgeInsets.only(left: 20, right: 20, bottom: 12),
                child: Text(
                  'Oprește sesiunea curentă pentru a schimba modul',
                  style: AppTextStyles.labelSm,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _saveDefaultMode(String mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('default-listen-mode', mode);
  }

  Widget _buildContent(
      BuildContext context, ListeningState state, bool disableAnimations) {
    return switch (state.status) {
      ListeningStatus.idle => _buildIdle(context, state, disableAnimations),
      ListeningStatus.listening => _buildRecording(state, disableAnimations),
      ListeningStatus.streaming => _buildStreaming(state, disableAnimations),
      ListeningStatus.processing => _buildProcessing(),
      ListeningStatus.transcriptionReady =>
        _buildTranscriptionEdit(context, state),
      ListeningStatus.verdictReady => const SizedBox.shrink(),
      ListeningStatus.error => _buildError(context, state),
    };
  }

  Widget _buildIdle(
      BuildContext context, ListeningState state, bool disableAnimations) {
    final isStreaming = state.listenMode == ListenMode.streaming;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SoundWaveIndicator(active: false),
            const SizedBox(height: 24),
            Text(
              isStreaming ? 'Flux în timp real' : 'Înregistrare audio',
              style: AppTextStyles.headingSubsection.copyWith(fontSize: 18),
            ),
            const SizedBox(height: 8),
            Text(
              isStreaming
                  ? 'Pornește și începe să vorbești. Verificăm afirmațiile pe loc.'
                  : 'Înregistrează și trimite pentru verificare.',
              style: AppTextStyles.bodyMd,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            _LargeMicButton(
              onPressed: () {
                HapticFeedback.mediumImpact();
                if (isStreaming) {
                  context.read<ListeningBloc>().add(const StartStreaming());
                } else {
                  context.read<ListeningBloc>().add(const StartListening());
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecording(ListeningState state, bool disableAnimations) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SoundWaveIndicator(
            active: true,
            amplitudeStream: context.read<ListeningBloc>().amplitudeStream,
          ),
          const SizedBox(height: 24),
          Text(
            _formatTime(_displaySeconds),
            style: AppTextStyles.headingSubsection.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 4),
          const Text(
            'Se înregistrează...',
            style: AppTextStyles.labelMd,
          ),
        ],
      ),
    );
  }

  Widget _buildStreaming(ListeningState state, bool disableAnimations) {
    return StreamingTranscriptList(
      segments: state.segments,
      interimText: state.interimText,
      disableAnimations: disableAnimations,
    );
  }

  Widget _buildProcessing() {
    return const Padding(
      padding: EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Se procesează...',
            style: AppTextStyles.headingSubsection,
          ),
          SizedBox(height: 8),
          Text(
            'Audio se analizează. Se verifică afirmațiile.',
            style: AppTextStyles.bodyMd,
          ),
          SizedBox(height: 24),
          AppFeatureCard(
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
      ),
    );
  }

  Widget _buildTranscriptionEdit(BuildContext context, ListeningState state) {
    return _TranscriptionEditWidget(
      initialText: state.transcript ?? '',
      onCancel: () => context.read<ListeningBloc>().add(const ResetListening()),
      onSubmit: (text) =>
          context.read<ListeningBloc>().add(SubmitTranscription(text)),
    );
  }

  Widget _buildError(BuildContext context, ListeningState state) {
    return AppEmptyState(
      type: AppEmptyStateType.error,
      icon: Icons.error_outline_rounded,
      title: 'A apărut o eroare',
      description: state.errorMessage ?? 'Nu am putut procesa audio-ul.',
      actionLabel: 'Încearcă din Nou',
      onAction: () => context.read<ListeningBloc>().add(const ResetListening()),
    );
  }
}

class _LargeMicButton extends StatefulWidget {
  final VoidCallback? onPressed;

  const _LargeMicButton({this.onPressed});

  @override
  State<_LargeMicButton> createState() => _LargeMicButtonState();
}

class _LargeMicButtonState extends State<_LargeMicButton> {
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Semantics(
      button: true,
      label: 'Pornește',
      child: GestureDetector(
        onTap: widget.onPressed,
        child: Container(
          width: 76,
          height: 76,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: cs.secondary,
            boxShadow: [
              BoxShadow(
                color: cs.secondary.withValues(alpha: 0.3),
                blurRadius: 16,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Icon(Icons.mic_rounded, size: 32, color: cs.onSecondary),
        ),
      ),
    );
  }
}

class _AboveBottomNavFabLocation extends FloatingActionButtonLocation {
  const _AboveBottomNavFabLocation();

  @override
  Offset getOffset(ScaffoldPrelayoutGeometry scaffoldGeometry) {
    final standardOffset =
        FloatingActionButtonLocation.endFloat.getOffset(scaffoldGeometry);
    return Offset(standardOffset.dx, standardOffset.dy - 90.0);
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
  State<_TranscriptionEditWidget> createState() =>
      _TranscriptionEditWidgetState();
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
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Verifică textul',
            style: AppTextStyles.headingSubsection,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          const Text(
            'Textul detectat. Îl poți edita înainte de verificare.',
            style: AppTextStyles.bodyMd,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _controller,
            maxLines: 6,
            minLines: 3,
            decoration: const InputDecoration(
              hintText: 'Textul transcris va apărea aici...',
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
      ),
    );
  }
}
