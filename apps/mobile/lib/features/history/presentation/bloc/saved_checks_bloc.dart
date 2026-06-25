import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/saved_checks_repository_impl.dart';
import '../../domain/models/saved_check.dart';
import '../../domain/repositories/saved_checks_repository.dart';

sealed class SavedChecksEvent {
  const SavedChecksEvent();
}

class SavedChecksLoaded extends SavedChecksEvent {
  const SavedChecksLoaded();
}

class CheckSaved extends SavedChecksEvent {
  final String verdictId;
  const CheckSaved(this.verdictId);
}

class CheckRemoved extends SavedChecksEvent {
  final String verdictId;
  const CheckRemoved(this.verdictId);
}

class SavedChecksState extends Equatable {
  final List<SavedCheck> checks;
  final bool isLoading;
  final String? error;

  const SavedChecksState({
    this.checks = const [],
    this.isLoading = false,
    this.error,
  });

  @override
  List<Object?> get props => [checks, isLoading, error];
}

class SavedChecksBloc extends Bloc<SavedChecksEvent, SavedChecksState> {
  final SavedChecksRepository _repository;

  SavedChecksBloc({SavedChecksRepository? repository})
    : _repository = repository ?? SavedChecksRepositoryImpl(),
      super(const SavedChecksState()) {
    on<SavedChecksLoaded>(_onLoaded);
    on<CheckSaved>(_onSave);
    on<CheckRemoved>(_onRemove);
  }

  Future<void> _onLoaded(SavedChecksLoaded event, Emitter<SavedChecksState> emit) async {
    emit(const SavedChecksState(isLoading: true));
    try {
      final checks = await _repository.getAll();
      emit(SavedChecksState(checks: checks, isLoading: false));
    } catch (e) {
      emit(SavedChecksState(isLoading: false, error: 'Eroare la încărcare.'));
    }
  }

  Future<void> _onSave(CheckSaved event, Emitter<SavedChecksState> emit) async {
    await _repository.save(verdictId: event.verdictId);
    final checks = await _repository.getAll();
    emit(SavedChecksState(checks: checks, isLoading: false));
  }

  Future<void> _onRemove(CheckRemoved event, Emitter<SavedChecksState> emit) async {
    await _repository.remove(verdictId: event.verdictId);
    final checks = await _repository.getAll();
    emit(SavedChecksState(checks: checks, isLoading: false));
  }
}
