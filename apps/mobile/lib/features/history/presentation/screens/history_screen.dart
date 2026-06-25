import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../bloc/saved_checks_bloc.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verificări salvate')),
      body: BlocBuilder<SavedChecksBloc, SavedChecksState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.error != null) {
            return Center(child: Text(state.error!, style: const TextStyle(color: Colors.red)));
          }
          if (state.checks.isEmpty) {
            return const Center(child: Text('Nicio verificare salvată.'));
          }
          return ListView.builder(
            itemCount: state.checks.length,
            itemBuilder: (context, index) {
              final check = state.checks[index];
              return Dismissible(
                key: ValueKey(check.id),
                direction: DismissDirection.endToStart,
                onDismissed: (_) {
                  context.read<SavedChecksBloc>().add(CheckRemoved(check.id));
                },
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 16),
                  color: Colors.red,
                  child: const Icon(Icons.delete, color: Colors.white),
                ),
                child: ListTile(
                  title: Text(check.claimText ?? 'Verificare #${check.id.substring(0, 8)}'),
                  subtitle: check.verdict != null
                      ? Text('${check.verdict} · ${check.confidenceScore?.toStringAsFixed(0) ?? "-"}/100')
                      : Text('Salvată ${check.savedAt.substring(0, 10)}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.go('/check/${check.id}'),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
