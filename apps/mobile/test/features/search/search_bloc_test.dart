import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/features/search/domain/entities/search_result_entity.dart';
import 'package:verificat_mobile/features/search/domain/repositories/search_repository.dart';
import 'package:verificat_mobile/features/search/presentation/bloc/search_bloc.dart';

class MockSearchRepository implements SearchRepository {
  final Future<SearchResultList> Function({required String query, required int page, required int limit})? onSearch;
  final Future<SearchResultList> Function({required int limit})? onGetLatest;

  MockSearchRepository({this.onSearch, this.onGetLatest});

  @override
  Future<SearchResultList> search({String query = '', int page = 1, int limit = 20}) async {
    if (onSearch != null) return onSearch!(query: query, page: page, limit: limit);
    return const SearchResultList(results: [], total: 0, page: 1);
  }

  @override
  Future<SearchResultList> getLatest({int limit = 10}) async {
    if (onGetLatest != null) return onGetLatest!(limit: limit);
    return const SearchResultList(results: [], total: 0, page: 1);
  }
}

void main() {
  group('SearchBloc', () {
    test('initial state is empty', () {
      final bloc = SearchBloc(repository: MockSearchRepository());
      expect(bloc.state.query, '');
      expect(bloc.state.results, isEmpty);
      expect(bloc.state.isLoading, isFalse);
      bloc.close();
    });

    test('empty query clears results', () async {
      final bloc = SearchBloc(repository: MockSearchRepository());
      final states = <SearchState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const SearchQueryChanged('test'));
      await Future.delayed(const Duration(milliseconds: 10));
      bloc.add(const SearchQueryChanged(''));
      await Future.delayed(const Duration(milliseconds: 10));

      expect(bloc.state.query, '');
      expect(bloc.state.results, isEmpty);
      expect(bloc.state.isLoading, isFalse);
      bloc.close();
    });

    test('search returns results after debounce', () async {
      final bloc = SearchBloc(repository: MockSearchRepository(
        onSearch: ({required query, required page, required limit}) async {
          await Future.delayed(Duration.zero);
          return const SearchResultList(
            results: [
              SearchResultEntity(id: '1', verdict: 'True', confidenceScore: 95, explanation: 'Test', createdAt: '2024-01-01'),
            ],
            total: 1,
            page: 1,
          );
        },
      ));
      bloc.add(const SearchQueryChanged('test'));
      await Future.delayed(Duration.zero);
      expect(bloc.state.isLoading, isTrue);

      await Future.delayed(const Duration(milliseconds: 600));

      expect(bloc.state.isLoading, isFalse);
      expect(bloc.state.results.length, 1);
      expect(bloc.state.results[0].id, '1');
      bloc.close();
    });

    test('search error sets error state', () async {
      final bloc = SearchBloc(repository: MockSearchRepository(
        onSearch: ({required query, required page, required limit}) async {
          await Future.delayed(Duration.zero);
          throw Exception('API error');
        },
      ));
      bloc.add(const SearchQueryChanged('test'));
      await Future.delayed(Duration.zero);
      expect(bloc.state.isLoading, isTrue);

      await Future.delayed(const Duration(milliseconds: 600));

      expect(bloc.state.isLoading, isFalse);
      expect(bloc.state.error, isNotNull);
      bloc.close();
    });
  });
}
