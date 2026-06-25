import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/listening_bloc.dart';

class ListeningScreen extends StatelessWidget {
  const ListeningScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verificare Audio'),
        centerTitle: true,
      ),
      body: BlocBuilder<ListeningBloc, ListeningState>(
        builder: (context, state) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildStatusIcon(state.status),
                  const SizedBox(height: 24),
                  Text(
                    _statusText(state.status),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (state.errorMessage != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      state.errorMessage!,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.red.shade700,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const SizedBox(height: 32),
                  _buildActionButton(context, state.status),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusIcon(ListeningStatus status) {
    switch (status) {
      case ListeningStatus.idle:
        return const Icon(Icons.mic, size: 64, color: Colors.grey);
      case ListeningStatus.listening:
        return const SizedBox(
          width: 80,
          height: 80,
          child: CircularProgressIndicator(strokeWidth: 6),
        );
      case ListeningStatus.processing:
        return const SizedBox(
          width: 80,
          height: 80,
          child: CircularProgressIndicator(strokeWidth: 6),
        );
      case ListeningStatus.verdictReady:
        return const Icon(Icons.check_circle, size: 64, color: Colors.green);
      case ListeningStatus.error:
        return const Icon(Icons.error, size: 64, color: Colors.red);
    }
  }

  String _statusText(ListeningStatus status) {
    switch (status) {
      case ListeningStatus.idle:
        return 'Apăsați butonul pentru a începe verificarea';
      case ListeningStatus.listening:
        return 'Ascult...';
      case ListeningStatus.processing:
        return 'Se procesează...';
      case ListeningStatus.verdictReady:
        return 'Rezultatul este gata!';
      case ListeningStatus.error:
        return 'A apărut o eroare';
    }
  }

  Widget _buildActionButton(BuildContext context, ListeningStatus status) {
    switch (status) {
      case ListeningStatus.idle:
      case ListeningStatus.error:
        return FilledButton.icon(
          onPressed: () => context.read<ListeningBloc>().add(const StartListening()),
          icon: const Icon(Icons.mic),
          label: const Text('Începe Verificarea'),
          style: FilledButton.styleFrom(
            minimumSize: const Size(200, 48),
          ),
        );
      case ListeningStatus.listening:
        return FilledButton.icon(
          onPressed: () => context.read<ListeningBloc>().add(const StopListening()),
          icon: const Icon(Icons.stop),
          label: const Text('Oprește'),
          style: FilledButton.styleFrom(
            minimumSize: const Size(200, 48),
            backgroundColor: Colors.red,
          ),
        );
      case ListeningStatus.processing:
        return const SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(strokeWidth: 3),
        );
      case ListeningStatus.verdictReady:
        return FilledButton.icon(
          onPressed: () => context.read<ListeningBloc>().add(const StopListening()),
          icon: const Icon(Icons.refresh),
          label: const Text('Verifică din nou'),
          style: FilledButton.styleFrom(
            minimumSize: const Size(200, 48),
          ),
        );
    }
  }
}
