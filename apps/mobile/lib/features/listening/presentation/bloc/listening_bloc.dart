import 'dart:async';
import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/listening_repository_impl.dart';
import '../../data/services/transcript_stream_service.dart';
import '../../domain/entities/transcript_segment.dart';
import '../../domain/repositories/listening_repository.dart';

enum ListeningStatus { idle, listening, streaming, processing, transcriptionReady, verdictReady, error }

class ListeningState extends Equatable {
  final ListeningStatus status;
  final int elapsedSeconds;
  final String? verdictId;
  final String? transcript;
  final List<Map<String, dynamic>>? claimsData;
  final String? errorMessage;
  final String interimText;
  final List<TranscriptSegment> segments;

  const ListeningState({
    this.status = ListeningStatus.idle,
    this.elapsedSeconds = 0,
    this.verdictId,
    this.transcript,
    this.claimsData,
    this.errorMessage,
    this.interimText = '',
    this.segments = const [],
  });

  ListeningState copyWith({
    ListeningStatus? status,
    int? elapsedSeconds,
    String? verdictId,
    String? transcript,
    List<Map<String, dynamic>>? claimsData,
    String? errorMessage,
    String? interimText,
    List<TranscriptSegment>? segments,
  }) {
    return ListeningState(
      status: status ?? this.status,
      elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
      verdictId: verdictId ?? this.verdictId,
      transcript: transcript ?? this.transcript,
      claimsData: claimsData ?? this.claimsData,
      errorMessage: errorMessage ?? this.errorMessage,
      interimText: interimText ?? this.interimText,
      segments: segments ?? this.segments,
    );
  }

  @override
  List<Object?> get props => [status, elapsedSeconds, verdictId, transcript, claimsData, errorMessage, interimText, segments];
}

sealed class ListeningEvent {
  const ListeningEvent();
}

class StartListening extends ListeningEvent {
  const StartListening();
}

class StopListening extends ListeningEvent {
  const StopListening();
}

class StartStreaming extends ListeningEvent {
  const StartStreaming();
}

class StopStreaming extends ListeningEvent {
  const StopStreaming();
}

class TranscriptionReady extends ListeningEvent {
  final String transcript;
  const TranscriptionReady(this.transcript);
}

class SubmitTranscription extends ListeningEvent {
  final String text;
  const SubmitTranscription(this.text);
}

class VerdictReady extends ListeningEvent {
  final List<Map<String, dynamic>> claims;
  const VerdictReady(this.claims);
}

class ListeningFailed extends ListeningEvent {
  final String message;
  const ListeningFailed(this.message);
}

class InterruptionBegan extends ListeningEvent {
  const InterruptionBegan();
}

class InterruptionEnded extends ListeningEvent {
  const InterruptionEnded();
}

class ResetListening extends ListeningEvent {
  const ResetListening();
}

class TickSecond extends ListeningEvent {
  const TickSecond();
}

class UpdateInterim extends ListeningEvent {
  final String text;
  const UpdateInterim(this.text);
}

class AddFinalSegment extends ListeningEvent {
  final TranscriptSegment segment;
  const AddFinalSegment(this.segment);
}

class UpdateSegmentResult extends ListeningEvent {
  final String segmentId;
  final StreamingVerdict? verdict;
  final double? confidence;
  final String? explanation;
  final List<String> sources;
  final String? matchedFact;
  const UpdateSegmentResult({
    required this.segmentId,
    this.verdict,
    this.confidence,
    this.explanation,
    this.sources = const [],
    this.matchedFact,
  });
}

class ListeningBloc extends Bloc<ListeningEvent, ListeningState> {
  final ListeningRepository _repository;
  StreamSubscription<Map<String, dynamic>>? _jobStreamSub;
  StreamSubscription<void>? _interruptionBeganSub;
  StreamSubscription<void>? _interruptionEndedSub;
  Timer? _elapsedTimer;
  TranscriptStreamService? _streamingService;

  Stream<dynamic> get amplitudeStream => _repository.onAmplitude();

  ListeningBloc({ListeningRepository? repository})
      : _repository = repository ?? ListeningRepositoryImpl(),
        super(const ListeningState()) {
    on<StartListening>(_onStartListening);
    on<StopListening>(_onStopListening);
    on<StartStreaming>(_onStartStreaming);
    on<StopStreaming>(_onStopStreaming);
    on<TranscriptionReady>(_onTranscriptionReady);
    on<SubmitTranscription>(_onSubmitTranscription);
    on<VerdictReady>(_onVerdictReady);
    on<ListeningFailed>(_onListeningFailed);
    on<InterruptionBegan>(_onInterruptionBegan);
    on<InterruptionEnded>(_onInterruptionEnded);
    on<ResetListening>(_onReset);
    on<TickSecond>(_onTick);
    on<UpdateInterim>(_onUpdateInterim);
    on<AddFinalSegment>(_onAddFinalSegment);
    on<UpdateSegmentResult>(_onUpdateSegmentResult);

    _interruptionBeganSub = _repository.onInterruptionBegan.listen((_) {
      if (state.status == ListeningStatus.listening) {
        add(const InterruptionBegan());
      } else if (state.status == ListeningStatus.streaming) {
        add(const StopStreaming());
      }
    });
    _interruptionEndedSub = _repository.onInterruptionEnded.listen((_) {
      add(const InterruptionEnded());
    });
  }

  void _startElapsedTimer() {
    _elapsedTimer?.cancel();
    _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      add(const TickSecond());
    });
  }

  void _stopElapsedTimer() {
    _elapsedTimer?.cancel();
    _elapsedTimer = null;
  }

  void _onTick(TickSecond event, Emitter<ListeningState> emit) {
    emit(state.copyWith(elapsedSeconds: state.elapsedSeconds + 1));
  }

  void _onUpdateInterim(UpdateInterim event, Emitter<ListeningState> emit) {
    emit(state.copyWith(interimText: event.text));
  }

  void _onAddFinalSegment(AddFinalSegment event, Emitter<ListeningState> emit) {
    emit(state.copyWith(
      interimText: '',
      segments: [...state.segments, event.segment],
    ));
  }

  void _onUpdateSegmentResult(UpdateSegmentResult event, Emitter<ListeningState> emit) {
    final idx = state.segments.indexWhere((s) => s.segmentId == event.segmentId);
    if (idx == -1) return;
    final updated = List<TranscriptSegment>.from(state.segments);
    updated[idx] = updated[idx].withVerdict(
      verdict: event.verdict,
      confidence: event.confidence,
      explanation: event.explanation,
      sources: event.sources,
      matchedFact: event.matchedFact,
    );
    emit(state.copyWith(segments: updated));
  }

  Future<void> _onStartListening(
      StartListening event, Emitter<ListeningState> emit) async {
    final s = state.status;
    if (s == ListeningStatus.listening || s == ListeningStatus.streaming) return;

    final granted = await _repository.requestMicPermission();
    if (!granted) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Permisiunea pentru microfon a fost refuzată.',
      ));
      return;
    }

    try {
      await _repository.startRecording();
      emit(state.copyWith(
        status: ListeningStatus.listening,
        elapsedSeconds: 0,
        errorMessage: null,
      ));
      _startElapsedTimer();
    } catch (e) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Eroare la pornirea înregistrării.',
      ));
    }
  }

  Future<void> _onStartStreaming(
      StartStreaming event, Emitter<ListeningState> emit) async {
    final s = state.status;
    if (s == ListeningStatus.listening || s == ListeningStatus.streaming) return;

    final granted = await _repository.requestMicPermission();
    if (!granted) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Permisiunea pentru microfon a fost refuzată.',
      ));
      return;
    }

    try {
      await _repository.startStreaming();
      _streamingService = _repository.streamingService;

      emit(state.copyWith(
        status: ListeningStatus.streaming,
        elapsedSeconds: 0,
        errorMessage: null,
        interimText: '',
        segments: const [],
      ));
      _startElapsedTimer();
    } catch (e) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Eroare la pornirea fluxului audio.',
      ));
    }
  }

  Future<void> _onStopListening(
      StopListening event, Emitter<ListeningState> emit) async {
    _stopElapsedTimer();

    if (state.status != ListeningStatus.listening) {
      debugPrint('[ListeningBloc] stop: state is ${state.status}, resetting');
      emit(const ListeningState());
      return;
    }

    emit(state.copyWith(status: ListeningStatus.processing));
    debugPrint('[ListeningBloc] stop: emitted processing');

    try {
      debugPrint('[ListeningBloc] stop: calling stopRecording');
      await _repository.stopRecording();
      debugPrint('[ListeningBloc] stop: stopRecording done, calling transcribeAudio');
      
      final transcript = await _repository
          .transcribeAudio()
          .timeout(const Duration(seconds: 35));

      if (transcript == null || transcript.trim().isEmpty) {
        emit(state.copyWith(
          status: ListeningStatus.error,
          errorMessage: 'Nu a fost detectată voce.',
        ));
        return;
      }

      add(TranscriptionReady(transcript));
    } on TimeoutException {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Conexiunea cu serverul a expirat.',
      ));
    } catch (e) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Eroare la procesare.',
      ));
    }
  }

  Future<void> _onStopStreaming(
      StopStreaming event, Emitter<ListeningState> emit) async {
    _stopElapsedTimer();
    await _repository.stopStreaming();
    _streamingService = null;

    final transcript = state.segments.map((s) => s.text).join(' ').trim();
    if (transcript.isEmpty) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Nu a fost detectată voce.',
      ));
      return;
    }

    add(TranscriptionReady(transcript));
  }

  void _onTranscriptionReady(
      TranscriptionReady event, Emitter<ListeningState> emit) {
    emit(state.copyWith(
      status: ListeningStatus.transcriptionReady,
      transcript: event.transcript,
    ));
  }

  Future<void> _onSubmitTranscription(
      SubmitTranscription event, Emitter<ListeningState> emit) async {
    final text = event.text.trim();
    if (text.isEmpty) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Textul nu poate fi gol.',
      ));
      return;
    }

    emit(state.copyWith(status: ListeningStatus.processing));

    try {
      final result = await _repository.verifyText(text);
      final jobId = result['jobId']?.toString();
      
      if (jobId == null) {
        emit(state.copyWith(
          status: ListeningStatus.error,
          errorMessage: 'Eroare la pornirea verificării.',
        ));
        return;
      }

      _jobStreamSub = _repository.streamJobEvents(jobId).listen(
        (event) {
          if (event['type'] == 'completed') {
            final claims = event['claims'] as List<dynamic>? ?? [];
            add(VerdictReady(claims.cast<Map<String, dynamic>>()));
          } else if (event['type'] == 'failed') {
            add(const ListeningFailed('Procesarea a eșuat.'));
          }
        },
        onError: (_) {
          add(const ListeningFailed('Eroare la primirea rezultatelor.'));
        },
      );
    } catch (e) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Eroare la trimiterea textului.',
      ));
    }
  }

  void _onVerdictReady(
      VerdictReady event, Emitter<ListeningState> emit) {
    _jobStreamSub?.cancel();
    emit(state.copyWith(
      status: ListeningStatus.verdictReady,
      claimsData: event.claims,
    ));
  }

  void _onListeningFailed(
      ListeningFailed event, Emitter<ListeningState> emit) {
    _jobStreamSub?.cancel();
    emit(state.copyWith(
      status: ListeningStatus.error,
      errorMessage: event.message,
    ));
  }

  Future<void> _onInterruptionBegan(
      InterruptionBegan event, Emitter<ListeningState> emit) async {
    _stopElapsedTimer();
    try {
      await _repository.stopRecording();
      await _repository.stopStreaming();
    } catch (_) {}
    if (!emit.isDone) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Înregistrarea a fost întreruptă.',
      ));
    }
  }

  Future<void> _onInterruptionEnded(
      InterruptionEnded event, Emitter<ListeningState> emit) async {
    final granted = await _repository.requestMicPermission();
    if (!granted) return;
    try {
      await _repository.startRecording();
      emit(state.copyWith(status: ListeningStatus.listening, elapsedSeconds: 0));
      _startElapsedTimer();
    } catch (_) {}
  }

  void reset() {
    if (_streamingService != null) {
      _repository.stopStreaming();
      _streamingService = null;
    }
    _jobStreamSub?.cancel();
    add(const ResetListening());
  }

  void _onReset(ResetListening event, Emitter<ListeningState> emit) {
    _stopElapsedTimer();
    emit(const ListeningState());
  }

  @override
  Future<void> close() {
    _repository.stopStreaming();
    _jobStreamSub?.cancel();
    _interruptionBeganSub?.cancel();
    _interruptionEndedSub?.cancel();
    _stopElapsedTimer();
    return super.close();
  }
}