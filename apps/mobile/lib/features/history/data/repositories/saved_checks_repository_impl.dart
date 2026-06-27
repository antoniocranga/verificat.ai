import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/models/saved_check.dart';
import '../../domain/repositories/saved_checks_repository.dart';

class SavedChecksRepositoryImpl implements SavedChecksRepository {
  static const _key = 'saved_checks';

  @override
  Future<List<SavedCheck>> getAll() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list.map((e) => SavedCheck(
      id: e['id'] as String,
      claimText: e['claimText'] as String?,
      verdict: e['verdict'] as String?,
      confidenceScore: (e['confidenceScore'] as num?)?.toDouble(),
      savedAt: e['savedAt'] as String,
    )).toList();
  }

  @override
  Future<void> save({required String verdictId}) async {
    final checks = await getAll();
    if (checks.any((c) => c.id == verdictId)) return;
    final updated = [
      SavedCheck(id: verdictId, savedAt: DateTime.now().toIso8601String()),
      ...checks,
    ];
    await _persist(updated);
  }

  @override
  Future<void> remove({required String verdictId}) async {
    final checks = await getAll();
    checks.removeWhere((c) => c.id == verdictId);
    await _persist(checks);
  }

  @override
  Future<bool> isSaved({required String verdictId}) async {
    final checks = await getAll();
    return checks.any((c) => c.id == verdictId);
  }

  Future<void> _persist(List<SavedCheck> checks) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(checks.map((c) => {
      'id': c.id,
      'claimText': c.claimText,
      'verdict': c.verdict,
      'confidenceScore': c.confidenceScore,
      'savedAt': c.savedAt,
    }).toList());
    await prefs.setString(_key, raw);
  }
}
