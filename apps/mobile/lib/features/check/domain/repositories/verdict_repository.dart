import '../entities/verdict.dart';

abstract class VerdictRepository {
  Future<Verdict> getVerdict(String id, {String? token});
}
