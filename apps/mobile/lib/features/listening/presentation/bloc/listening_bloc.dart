import 'dart:async';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/listening_repository_impl.dart';
import '../../domain/repositories/listening_repository.dart';

enum ListeningStatus { idle, listening, processing, verdictReady, error }

class ListeningState extends Equatable {
  final ListeningStatus status;
  final int elapsedSeconds;
  final String? verdictId;
  final List<Map<String, dynamic>>? claimsData;
  final String? errorMessage;

  const ListeningState({
    this.status = ListeningStatus.idle,
    this.elapsedSeconds = 0,
    this.verdictId,
    this.claimsData,
    this.errorMessage,
  });

  ListeningState copyWith({
    ListeningStatus? status,
    int? elapsedSeconds,
    String? verdictId,
    List<Map<String, dynamic>>? claimsData,
    String? errorMessage,
  }) {
    return ListeningState(
      status: status ?? this.status,
      elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
      verdictId: verdictId ?? this.verdictId,
      claimsData: claimsData ?? this.claimsData,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, elapsedSeconds, verdictId, claimsData, errorMessage];
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

class ListeningBloc extends Bloc<ListeningEvent, ListeningState> {
  final ListeningRepository _repository;
  StreamSubscription<Map<String, dynamic>>? _jobStreamSub;
  StreamSubscription<void>? _interruptionBeganSub;
  StreamSubscription<void>? _interruptionEndedSub;
  Timer? _elapsedTimer;

  ListeningBloc({ListeningRepository? repository})
      : _repository = repository ?? ListeningRepositoryImpl(),
        super(const ListeningState()) {
    on<StartListening>(_onStartListening);
    on<StopListening>(_onStopListening);
    on<VerdictReady>(_onVerdictReady);
    on<ListeningFailed>(_onListeningFailed);
    on<InterruptionBegan>(_onInterruptionBegan);
    on<InterruptionEnded>(_onInterruptionEnded);
    on<ResetListening>(_onReset);
    on<TickSecond>(_onTick);

    _interruptionBeganSub = _repository.onInterruptionBegan.listen((_) {
      if (state.status == ListeningStatus.listening) {
        add(const InterruptionBegan());
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

  Future<void> _onStartListening(
      StartListening event, Emitter<ListeningState> emit) async {
    if (state.status == ListeningStatus.listening) return;

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

  void _onStopListening(
      StopListening event, Emitter<ListeningState> emit) async {
    _stopElapsedTimer();

    if (state.status == ListeningStatus.listening) {
      emit(state.copyWith(status: ListeningStatus.processing));

      try {
        await _repository.stopRecording();
        final jobId = await _repository.uploadAndVerify();

        if (jobId == null) {
          emit(state.copyWith(
            status: ListeningStatus.error,
            errorMessage: 'Eroare la încărcarea înregistrării.',
          ));
          return;
        }

        _jobStreamSub = _repository.streamJobEvents(jobId).listen(
              (event) {
            if (event['type'] == 'completed') {
              final claims = event['claims'] as List<dynamic>?;
              if (claims != null && claims.isNotEmpty) {
                add(VerdictReady(claims.cast<Map<String, dynamic>>()));
              }
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
          errorMessage: 'Eroare la procesare.',
        ));
      }
    } else {
      emit(const ListeningState());
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
    } catch (_) {}
    emit(state.copyWith(
      status: ListeningStatus.error,
      errorMessage: 'Înregistrarea a fost întreruptă.',
    ));
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
    _jobStreamSub?.cancel();
    add(const ResetListening());
  }

  void _onReset(ResetListening event, Emitter<ListeningState> emit) {
    _stopElapsedTimer();
    emit(const ListeningState());
  }

  @override
  Future<void> close() {
    _jobStreamSub?.cancel();
    _interruptionBeganSub?.cancel();
    _interruptionEndedSub?.cancel();
    _stopElapsedTimer();
    return super.close();
  }
}
