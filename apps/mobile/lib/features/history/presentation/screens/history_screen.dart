import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/widgets.dart';
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
            return Center(
              child: Text(state.error!,
                  style: const TextStyle(color: Color(0xFFEE0000))),
            );
          }
          if (state.checks.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.bookmark_border,
                      size: 48, color: Color(0xFF8F8F8F)),
                  const SizedBox(height: 12),
                  Text('Nicio verificare salvată.',
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(color: const Color(0xFF4D4D4D))),
                  const SizedBox(height: 4),
                  Text('Verifică o afirmație și salveaz-o aici.',
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: const Color(0xFF8F8F8F))),
                ],
              ),
            );
          }
          return ListView.builder(
            itemCount: state.checks.length,
            itemBuilder: (context, index) {
              final check = state.checks[index];
              return Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Dismissible(
                  key: ValueKey(check.id),
                  direction: DismissDirection.endToStart,
                  onDismissed: (_) {
                    context.read<SavedChecksBloc>().add(CheckRemoved(check.id));
                  },
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 16),
                    color: const Color(0xFFEE0000),
                    child: const Icon(Icons.delete, color: Color(0xFFFFFFFF)),
                  ),
                  child: AppFeatureCard(
                    child: InkWell(
                      onTap: () => context.push('/check/${check.id}'),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  check.claimText ??
                                      'Verificare #${check.id.substring(0, 8)}',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  check.verdict != null
                                      ? '${check.verdict} · ${check.confidenceScore?.toStringAsFixed(0) ?? "-"}/100'
                                      : 'Salvată ${check.savedAt.substring(0, 10)}',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                          color: const Color(0xFF8F8F8F)),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right, size: 20),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
