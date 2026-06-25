import 'dart:async';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/search_repository_impl.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/repositories/search_repository.dart';

sealed class SearchEvent {
  const SearchEvent();
}

class SearchQueryChanged extends SearchEvent {
  final String query;
  const SearchQueryChanged(this.query);
}

class _SearchDebounceEvent extends SearchEvent {
  final String query;
  const _SearchDebounceEvent(this.query);
}

class SearchLoadMore extends SearchEvent {
  const SearchLoadMore();
}

class SearchState extends Equatable {
  final List<SearchResultEntity> results;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final String query;
  final int page;
  final int total;

  const SearchState({
    this.results = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.query = '',
    this.page = 1,
    this.total = 0,
  });

  SearchState copyWith({
    List<SearchResultEntity>? results,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    String? query,
    int? page,
    int? total,
  }) {
    return SearchState(
      results: results ?? this.results,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      query: query ?? this.query,
      page: page ?? this.page,
      total: total ?? this.total,
    );
  }

  @override
  List<Object?> get props => [results, isLoading, isLoadingMore, error, query, page, total];
}

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  final SearchRepository _repository;
  Timer? _debounceTimer;

  SearchBloc({SearchRepository? repository})
    : _repository = repository ?? SearchRepositoryImpl(),
      super(const SearchState()) {
    on<SearchQueryChanged>(_onQueryChanged);
    on<_SearchDebounceEvent>(_onDebounceSearch);
    on<SearchLoadMore>(_onLoadMore);
  }

  void _onQueryChanged(SearchQueryChanged event, Emitter<SearchState> emit) {
    _debounceTimer?.cancel();
    if (event.query.isEmpty) {
      emit(state.copyWith(results: [], query: '', error: null, isLoading: false));
      return;
    }
    emit(state.copyWith(isLoading: true, query: event.query, error: null));
    _debounceTimer = Timer(const Duration(milliseconds: 400), () {
        add(_SearchDebounceEvent(event.query));
    });
  }

  Future<void> _onDebounceSearch(_SearchDebounceEvent event, Emitter<SearchState> emit) async {
    try {
      final result = await _repository.search(query: event.query);
      emit(state.copyWith(
        results: result.results,
        isLoading: false,
        page: result.page,
        total: result.total,
      ));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: 'Eroare la căutare.'));
    }
  }

  Future<void> _onLoadMore(SearchLoadMore event, Emitter<SearchState> emit) async {
    if (state.isLoadingMore || state.results.length >= state.total) return;
    emit(state.copyWith(isLoadingMore: true));
    try {
      final nextPage = state.page + 1;
      final result = await _repository.search(query: state.query, page: nextPage);
      emit(state.copyWith(
        results: [...state.results, ...result.results],
        isLoadingMore: false,
        page: nextPage,
        total: result.total,
      ));
    } catch (_) {
      emit(state.copyWith(isLoadingMore: false, error: 'Eroare la încărcare.'));
    }
  }

  @override
  Future<void> close() {
    _debounceTimer?.cancel();
    return super.close();
  }
}
