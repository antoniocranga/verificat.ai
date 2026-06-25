import 'package:flutter_test/flutter_test.dart';
import 'package:verificat_mobile/core/permissions/permission_service.dart';
import 'package:verificat_mobile/features/listening/presentation/bloc/listening_bloc.dart';

class MockPermissionService extends PermissionService {
  final bool grantPermission;
  const MockPermissionService(this.grantPermission);

  @override
  Future<bool> requestMicPermission() async => grantPermission;

  @override
  Future<bool> hasMicPermission() async => grantPermission;
}

void main() {
  group('ListeningBloc', () {
    test('initial state is idle', () {
      final bloc = ListeningBloc(
        permissionService: const MockPermissionService(true),
      );
      expect(bloc.state.status, ListeningStatus.idle);
      expect(bloc.state.verdictId, isNull);
      expect(bloc.state.errorMessage, isNull);
      bloc.close();
    });

    test('transitions to listening when mic permission is granted', () async {
      final bloc = ListeningBloc(
        permissionService: const MockPermissionService(true),
      );
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);

      expect(states.length, 1);
      expect(states[0].status, ListeningStatus.listening);
      bloc.close();
    });

    test('transitions to error when mic permission is denied', () async {
      final bloc = ListeningBloc(
        permissionService: const MockPermissionService(false),
      );
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);

      expect(states.length, 1);
      expect(states[0].status, ListeningStatus.error);
      expect(states[0].errorMessage, isNotNull);
      bloc.close();
    });

    test('full flow: start → stop returns to idle', () async {
      final bloc = ListeningBloc(
        permissionService: const MockPermissionService(true),
      );
      final states = <ListeningStatus>[];
      bloc.stream.listen((s) => states.add(s.status));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      bloc.add(const StopListening());
      await Future.delayed(Duration.zero);

      expect(states, [ListeningStatus.listening, ListeningStatus.idle]);
      bloc.close();
    });

    test('full flow: start → verdict → stop', () async {
      final bloc = ListeningBloc(
        permissionService: const MockPermissionService(true),
      );
      final states = <ListeningStatus>[];
      bloc.stream.listen((s) => states.add(s.status));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      bloc.add(const VerdictReceived('v-123'));
      await Future.delayed(Duration.zero);
      bloc.add(const StopListening());
      await Future.delayed(Duration.zero);

      expect(states, [
        ListeningStatus.listening,
        ListeningStatus.verdictReady,
        ListeningStatus.idle,
      ]);
      bloc.close();
    });

    test('full flow: start → error → stop returns to idle', () async {
      final bloc = ListeningBloc(
        permissionService: const MockPermissionService(true),
      );
      final states = <ListeningStatus>[];
      bloc.stream.listen((s) => states.add(s.status));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      bloc.add(const ListeningFailed('Network error'));
      await Future.delayed(Duration.zero);
      bloc.add(const StopListening());
      await Future.delayed(Duration.zero);

      expect(states, [
        ListeningStatus.listening,
        ListeningStatus.error,
        ListeningStatus.idle,
      ]);
      bloc.close();
    });

    test('VerdictReceived stores verdict id', () async {
      final bloc = ListeningBloc(
        permissionService: const MockPermissionService(true),
      );
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      bloc.add(const VerdictReceived('v-789'));
      await Future.delayed(Duration.zero);

      expect(states.length, 2);
      expect(states[1].status, ListeningStatus.verdictReady);
      expect(states[1].verdictId, 'v-789');
      bloc.close();
    });

    test('ListeningFailed stores error message', () async {
      final bloc = ListeningBloc(
        permissionService: const MockPermissionService(true),
      );
      final states = <ListeningState>[];
      bloc.stream.listen((s) => states.add(s));

      bloc.add(const StartListening());
      await Future.delayed(Duration.zero);
      bloc.add(const ListeningFailed('Timeout'));
      await Future.delayed(Duration.zero);

      expect(states.length, 2);
      expect(states[1].status, ListeningStatus.error);
      expect(states[1].errorMessage, 'Timeout');
      bloc.close();
    });
  });
}
