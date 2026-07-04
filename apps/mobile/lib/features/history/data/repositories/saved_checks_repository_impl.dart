import '../../../../core/api/sessions_api_service.dart';
import '../../domain/models/saved_check.dart';
import '../../domain/repositories/saved_checks_repository.dart';

class SavedChecksRepositoryImpl implements SavedChecksRepository {
  final SessionsApiService _api;

  SavedChecksRepositoryImpl({SessionsApiService? api})
      : _api = api ?? SessionsApiService();

  @override
  Future<List<SavedCheck>> getAll() async {
    final response = await _api.listSessions();
    final data = (response['data'] as List<dynamic>?) ?? [];
    return data
        .map((e) => SavedCheck.fromSessionJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<void> save({required String verdictId}) async {
    // Sessions are auto-persisted server-side — no client save needed.
    // This method is kept for interface compatibility but is a no-op.
  }

  @override
  Future<void> remove({required String verdictId}) async {
    await _api.deleteSession(verdictId);
  }

  @override
  Future<bool> isSaved({required String verdictId}) async {
    try {
      await _api.getSession(verdictId);
      return true;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<void> clearAll() async {
    // No bulk delete endpoint; individual deletion is handled via UI swipe.
  }
}
