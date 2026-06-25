import 'dart:async';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/listening_repository_impl.dart';
import '../../domain/repositories/listening_repository.dart';

enum ListeningStatus { idle, listening, processing, verdictReady, error }

class ListeningState extends Equatable {
  final ListeningStatus status;
  final String? verdictId;
  final String? errorMessage;

  const ListeningState({
    this.status = ListeningStatus.idle,
    this.verdictId,
    this.errorMessage,
  });

  ListeningState copyWith({
    ListeningStatus? status,
    String? verdictId,
    String? errorMessage,
  }) {
    return ListeningState(
      status: status ?? this.status,
      verdictId: verdictId ?? this.verdictId,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, verdictId, errorMessage];
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

class VerdictReceived extends ListeningEvent {
  final String verdictId;
  const VerdictReceived(this.verdictId);
}

class ListeningFailed extends ListeningEvent {
  final String message;
  const ListeningFailed(this.message);
}

class ListeningBloc extends Bloc<ListeningEvent, ListeningState> {
  final ListeningRepository _repository;
  StreamSubscription<Map<String, dynamic>>? _jobStreamSub;

  ListeningBloc({ListeningRepository? repository})
    : _repository = repository ?? ListeningRepositoryImpl(),
      super(const ListeningState()) {
    on<StartListening>(_onStartListening);
    on<StopListening>(_onStopListening);
    on<VerdictReceived>(_onVerdictReceived);
    on<ListeningFailed>(_onListeningFailed);
  }

  Future<void> _onStartListening(
    StartListening event,
    Emitter<ListeningState> emit,
  ) async {
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
      emit(state.copyWith(status: ListeningStatus.listening));
    } catch (e) {
      emit(state.copyWith(
        status: ListeningStatus.error,
        errorMessage: 'Eroare la pornirea înregistrării.',
      ));
    }
  }

  Future<void> _onStopListening(
    StopListening event,
    Emitter<ListeningState> emit,
  ) async {
    if (state.status != ListeningStatus.listening) {
      emit(state.copyWith(status: ListeningStatus.idle));
      return;
    }

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
          if (event['type'] == 'verdict' && event['verdictId'] != null) {
            add(VerdictReceived(event['verdictId'] as String));
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
  }

  void _onVerdictReceived(
    VerdictReceived event,
    Emitter<ListeningState> emit,
  ) {
    _jobStreamSub?.cancel();
    emit(state.copyWith(
      status: ListeningStatus.verdictReady,
      verdictId: event.verdictId,
    ));
  }

  void _onListeningFailed(
    ListeningFailed event,
    Emitter<ListeningState> emit,
  ) {
    _jobStreamSub?.cancel();
    emit(state.copyWith(
      status: ListeningStatus.error,
      errorMessage: event.message,
    ));
  }

  void reset() {
    _jobStreamSub?.cancel();
    emit(const ListeningState());
  }

  @override
  Future<void> close() {
    _jobStreamSub?.cancel();
    return super.close();
  }
}
