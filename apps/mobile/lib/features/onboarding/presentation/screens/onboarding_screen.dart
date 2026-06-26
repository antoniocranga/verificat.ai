import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../core/widgets/widgets.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const OnboardingScreen({super.key, required this.onComplete});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _next() {
    if (_currentPage < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _finish() async {
    await Permission.microphone.request();
    widget.onComplete();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (i) => setState(() => _currentPage = i),
                children: [
                  _buildPage(
                    icon: Icons.verified_outlined,
                    title: 'Verifică informațiile\ncu încredere',
                    body:
                        'Verificat te ajută să identifici afirmațiile false sau înșelătoare în timp real. Analizăm surse de încredere pentru a-ți oferi un verdict rapid și documentat.',
                  ),
                  _buildPage(
                    icon: Icons.mic,
                    title: 'Cum funcționează',
                    body:
                        'Pornești o înregistrare, noi ascultăm și identificăm afirmațiile cheie. Verificăm fiecare afirmație comparând cu surse sigure și îți arătăm rezultatul cu explicații și surse.',
                  ),
                  _buildPage(
                    icon: Icons.security,
                    title: 'Permisiune microfon',
                    body:
                        'Pentru a verifica afirmațiile din audio, avem nevoie de acces la microfon. Audio este procesat în timp real și nu este stocat după verificare.',
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                  _buildDots(),
                  const Spacer(),
                  if (_currentPage < 2)
                    AppSmallPrimaryButton(
                      label: 'Continuă',
                      onPressed: _next,
                    )
                  else
                    AppSmallPrimaryButton(
                      label: 'Începe verificarea',
                      onPressed: _finish,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage({
    required IconData icon,
    required String title,
    required String body,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 80, color: Theme.of(context).colorScheme.onSurface),
          const SizedBox(height: 32),
          Text(
            title,
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
              color: Theme.of(context).colorScheme.onSurface,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            body,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: const Color(0xFF4D4D4D),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildDots() {
    return Row(
      children: List.generate(3, (i) {
        return Container(
          margin: const EdgeInsets.only(right: 8),
          width: _currentPage == i ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: _currentPage == i
                ? Theme.of(context).colorScheme.onSurface
                : const Color(0xFFEBEBEB),
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}
