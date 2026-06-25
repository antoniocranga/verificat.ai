import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/widgets/widgets.dart';
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
                  _buildStatusIndicator(state.status),
                  const SizedBox(height: 24),
                  Text(
                    _statusText(state.status),
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w600),
                    textAlign: TextAlign.center,
                  ),
                  if (state.errorMessage != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      state.errorMessage!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFEE0000)),
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

  Widget _buildStatusIndicator(ListeningStatus status) {
    if (status == ListeningStatus.listening || status == ListeningStatus.processing) {
      return SizedBox(
        width: 16,
        height: 16,
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.0, end: 1.0),
          duration: const Duration(milliseconds: 1000),
          builder: (context, value, child) {
            return Opacity(
              opacity: 0.3 + (0.7 * value),
              child: Container(
                width: 16,
                height: 16,
                decoration: const BoxDecoration(
                  color: Color(0xFFEBEBEB),
                  shape: BoxShape.circle,
                ),
              ),
            );
          },
        ),
      );
    }
    if (status == ListeningStatus.verdictReady) {
      return const Icon(Icons.check_circle, size: 64, color: Color(0xFF4CAF50));
    }
    if (status == ListeningStatus.error) {
      return const Icon(Icons.error, size: 64, color: Color(0xFFEE0000));
    }
    return const SizedBox(width: 64, height: 64);
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
        return AppSmallPrimaryButton(
          label: 'Începe Verificarea',
          onPressed: () => context.read<ListeningBloc>().add(const StartListening()),
        );
      case ListeningStatus.listening:
        return AppSmallPrimaryButton(
          label: 'Oprește',
          foregroundColor: const Color(0xFFEE0000),
          onPressed: () => context.read<ListeningBloc>().add(const StopListening()),
        );
      case ListeningStatus.processing:
        return const SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(strokeWidth: 3),
        );
      case ListeningStatus.verdictReady:
        return AppSmallPrimaryButton(
          label: 'Verifică din nou',
          onPressed: () => context.read<ListeningBloc>().add(const StopListening()),
        );
    }
  }
}
