import '../../domain/entities/verdict.dart';
import '../../domain/repositories/verdict_repository.dart';
import '../datasources/verdict_remote_datasource.dart';

class VerdictRepositoryImpl implements VerdictRepository {
  final VerdictRemoteDataSource _remoteDataSource;

  VerdictRepositoryImpl({VerdictRemoteDataSource? remoteDataSource})
      : _remoteDataSource = remoteDataSource ?? VerdictRemoteDataSource();

  @override
  Future<Verdict> getVerdict(String id) async {
    final json = await _remoteDataSource.getVerdict(id);
    return Verdict.fromJson(json);
  }
}
