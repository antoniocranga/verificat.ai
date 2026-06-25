import '../entities/search_result_entity.dart';

abstract class SearchRepository {
  Future<SearchResultList> search({String query = '', int page = 1, int limit = 20});
  Future<SearchResultList> getLatest({int limit = 10});
}

class SearchResultList {
  final List<SearchResultEntity> results;
  final int total;
  final int page;

  const SearchResultList({required this.results, required this.total, required this.page});
}
