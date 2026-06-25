import '../../../../core/api/verdict_api_service.dart';

class VerdictRemoteDataSource {
  final VerdictApiService _api;

  VerdictRemoteDataSource({VerdictApiService? api})
      : _api = api ?? VerdictApiService();

  Future<Map<String, dynamic>> getVerdict(String id) {
    return _api.getVerdict(id);
  }
}
