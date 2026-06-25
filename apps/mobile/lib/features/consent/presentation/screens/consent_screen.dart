import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ConsentScreen extends StatelessWidget {
  final VoidCallback onAccept;

  const ConsentScreen({super.key, required this.onAccept});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              const Center(
                child: Text(
                  'Verificat',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -0.4,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              const Text(
                'Confidențialitatea datelor',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              const _Section(
                title: 'Ce date colectăm',
                body:
                    'Când utilizați Verificat, colectăm următoarele categorii de date:',
                items: [
                  'Cont: adresa de email și numele (dacă vă creați un cont)',
                  'Audio: înregistrări procesate în timp real pentru verificarea afirmațiilor. Audiole nu sunt stocate după procesare.',
                  'Utilizare: statistici anonime despre interacțiunile cu aplicația.',
                ],
              ),
              const _Section(
                title: 'Cum folosim datele',
                body:
                    'Datele colectate sunt utilizate exclusiv pentru a furniza serviciul de verificare, a îmbunătăți acuratețea și a oferi asistență tehnică.',
              ),
              const _Section(
                title: 'Stocare și securitate',
                body:
                    'Datele sunt stocate pe servere securizate în Uniunea Europeană, cu criptare în tranzit (TLS) și în repaus. Accesul este restricționat conform principiului minimului privilegiu.',
              ),
              const _Section(
                title: 'Drepturile dumneavoastră (GDPR)',
                body:
                    'Aveți dreptul de acces, rectificare, ștergere ("dreptul de a fi uitat"), portabilitate și opoziție privind datele dumneavoastră.',
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
                    style: TextStyle(
                      color: Color(0xFF3B82F6),
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton(
                  onPressed: onAccept,
                  child: const Text(
                    'Am înțeles. Continuați',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  'Puteți revizui această politică oricând din setări.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final String body;
  final List<String>? items;

  const _Section({
    required this.title,
    required this.body,
    this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
              height: 1.5,
            ),
          ),
          if (items != null) ...[
            const SizedBox(height: 8),
            ...items!.map(
              (item) => Padding(
                padding: const EdgeInsets.only(left: 16, bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ', style: TextStyle(fontSize: 14)),
                    Expanded(
                      child: Text(
                        item,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
