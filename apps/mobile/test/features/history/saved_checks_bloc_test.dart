import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/features/history/domain/models/saved_check.dart';
import 'package:verificat_mobile/features/history/domain/repositories/saved_checks_repository.dart';
import 'package:verificat_mobile/features/history/presentation/bloc/saved_checks_bloc.dart';

class MockSavedChecksRepository implements SavedChecksRepository {
  final List<SavedCheck> _checks = [];

  @override
  Future<List<SavedCheck>> getAll() async => List.unmodifiable(_checks);

  @override
  Future<void> save({required String verdictId}) async {
    if (!_checks.any((c) => c.id == verdictId)) {
      _checks.insert(0, SavedCheck(id: verdictId, savedAt: DateTime.now().toIso8601String()));
    }
  }

  @override
  Future<void> remove({required String verdictId}) async {
    _checks.removeWhere((c) => c.id == verdictId);
  }

  @override
  Future<bool> isSaved({required String verdictId}) async {
    return _checks.any((c) => c.id == verdictId);
  }
}

void main() {
  group('SavedChecksBloc', () {
    test('initial state is empty', () {
      final bloc = SavedChecksBloc(repository: MockSavedChecksRepository());
      expect(bloc.state.checks, isEmpty);
      expect(bloc.state.isLoading, isFalse);
      bloc.close();
    });

    test('loads saved checks', () async {
      final bloc = SavedChecksBloc(repository: MockSavedChecksRepository());
      bloc.add(const SavedChecksLoaded());
      await Future.delayed(Duration.zero);
      expect(bloc.state.isLoading, isFalse);
      expect(bloc.state.checks, isEmpty);
      bloc.close();
    });

    test('save adds a check', () async {
      final bloc = SavedChecksBloc(repository: MockSavedChecksRepository());
      bloc.add(const CheckSaved('id-1'));
      await Future.delayed(Duration.zero);
      expect(bloc.state.checks.length, 1);
      expect(bloc.state.checks[0].id, 'id-1');
      bloc.close();
    });

    test('duplicate save is idempotent', () async {
      final bloc = SavedChecksBloc(repository: MockSavedChecksRepository());
      bloc.add(const CheckSaved('id-1'));
      await Future.delayed(Duration.zero);
      bloc.add(const CheckSaved('id-1'));
      await Future.delayed(Duration.zero);
      expect(bloc.state.checks.length, 1);
      bloc.close();
    });

    test('remove deletes a check', () async {
      final bloc = SavedChecksBloc(repository: MockSavedChecksRepository());
      bloc.add(const CheckSaved('id-1'));
      await Future.delayed(Duration.zero);
      expect(bloc.state.checks.length, 1);
      bloc.add(const CheckRemoved('id-1'));
      await Future.delayed(Duration.zero);
      expect(bloc.state.checks, isEmpty);
      bloc.close();
    });

    test('multiple saves keep newest first', () async {
      final bloc = SavedChecksBloc(repository: MockSavedChecksRepository());
      bloc.add(const CheckSaved('id-1'));
      await Future.delayed(Duration.zero);
      bloc.add(const CheckSaved('id-2'));
      await Future.delayed(Duration.zero);
      expect(bloc.state.checks.length, 2);
      expect(bloc.state.checks[0].id, 'id-2');
      expect(bloc.state.checks[1].id, 'id-1');
      bloc.close();
    });
  });
}
