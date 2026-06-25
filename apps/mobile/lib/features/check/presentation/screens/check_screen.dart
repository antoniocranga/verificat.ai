import 'package:flutter/material.dart';
import '../../../../core/widgets/widgets.dart';

class CheckScreen extends StatelessWidget {
  final String verdictId;

  const CheckScreen({super.key, required this.verdictId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rezultat Verificare')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sesiune: $verdictId',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: const Color(0xFF8F8F8F)),
            ),
            const SizedBox(height: 16),
            AppFeatureCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Verdict placeholder',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Conținutul verdictului va fi afișat aici.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF4D4D4D)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
