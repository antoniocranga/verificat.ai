import '../models/saved_check.dart';

abstract class SavedChecksRepository {
  Future<List<SavedCheck>> getAll();
  Future<void> save({required String verdictId});
  Future<void> remove({required String verdictId});
  Future<bool> isSaved({required String verdictId});
}
