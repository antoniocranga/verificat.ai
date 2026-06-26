import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/widgets/widgets.dart';

class ConsentScreen extends StatelessWidget {
  final VoidCallback onAccept;

  const ConsentScreen({super.key, required this.onAccept});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              Center(
                child: Text(
                  'Verificat',
                  style: Theme.of(context).textTheme.displayLarge,
                ),
              ),
              const SizedBox(height: 40),
              const MonoEyebrow(label: 'Confidențialitatea datelor'),
              const SizedBox(height: 16),
              AppFeatureCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Ce date colectăm', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 8),
                    Text(
                      'Când utilizați Verificat, colectăm următoarele categorii de date:',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF4D4D4D)),
                    ),
                    const SizedBox(height: 8),
                    _bullet('Cont: adresa de email și numele (dacă vă creați un cont)'),
                    _bullet('Audio: înregistrări procesate în timp real. Audiole nu sunt stocate după procesare.'),
                    _bullet('Utilizare: statistici anonime despre interacțiunile cu aplicația.'),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppFeatureCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Cum folosim datele', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 8),
                    Text(
                      'Datele colectate sunt utilizate exclusiv pentru a furniza serviciul de verificare, a îmbunătăți acuratețea și a oferi asistență tehnică.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF4D4D4D)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppFeatureCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Stocare și securitate', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 8),
                    Text(
                      'Datele sunt stocate pe servere securizate în Uniunea Europeană, cu criptare în tranzit (TLS) și în repaus. Accesul este restricționat conform principiului minimului privilegiu.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF4D4D4D)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              AppFeatureCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Drepturile dumneavoastră (GDPR)', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 8),
                    Text(
                      'Aveți dreptul de acces, rectificare, ștergere, portabilitate și opoziție privind datele dumneavoastră.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF4D4D4D)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => launchUrl(
                    Uri.parse('https://verificat.xyz/privacy'),
                    mode: LaunchMode.externalApplication,
                  ),
                  child: const Text(
                    'Politica completă de confidențialitate',
                    style: TextStyle(color: Color(0xFF0070F3)),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: AppPrimaryButton(label: 'Am înțeles. Continuați', onPressed: onAccept),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  'Puteți revizui această politică oricând din setări.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: const Color(0xFF8F8F8F)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bullet(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(fontSize: 14)),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, color: Color(0xFF4D4D4D), height: 1.5),
            ),
          ),
        ],
      ),
    );
  }
}
