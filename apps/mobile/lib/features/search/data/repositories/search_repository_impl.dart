import '../../domain/repositories/search_repository.dart';
import '../models/search_result_model.dart';
import '../../../../core/api/verdict_api_service.dart';

class SearchRepositoryImpl implements SearchRepository {
  final VerdictApiService _api;

  SearchRepositoryImpl({VerdictApiService? api})
    : _api = api ?? VerdictApiService();

  @override
  Future<SearchResultList> search({String query = '', int page = 1, int limit = 20}) async {
    final response = await _api.searchVerdicts(query: query, page: page, limit: limit);
    return _parseResponse(response);
  }

  @override
  Future<SearchResultList> getLatest({int limit = 10}) async {
    final response = await _api.searchVerdicts(query: '', page: 1, limit: limit);
    return _parseResponse(response);
  }

  SearchResultList _parseResponse(Map<String, dynamic> response) {
    final data = (response['data'] as List<dynamic>?) ?? [];
    return SearchResultList(
      results: data.map((e) => SearchResultModel.fromJson(e as Map<String, dynamic>).toEntity()).toList(),
      total: response['total'] as int? ?? data.length,
      page: response['page'] as int? ?? 1,
    );
  }
}
