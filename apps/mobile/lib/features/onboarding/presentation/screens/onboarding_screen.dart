import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/brand_text.dart';
import 'package:flutter_svg/flutter_svg.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const OnboardingScreen({super.key, required this.onComplete});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  static const _pages = [
    _OnboardingPage(
      icon: Icons.verified_outlined,
      title: 'Verifică informațiile\ncu încredere',
      body:
          'verificat.xyz te ajută să identifici afirmațiile false sau înșelătoare în timp real. Analizăm surse de încredere pentru a-ți oferi un verdict rapid și documentat.',
    ),
    _OnboardingPage(
      icon: Icons.mic_rounded,
      title: 'Cum funcționează',
      body:
          'Pornești o înregistrare, noi ascultăm și identificăm afirmațiile cheie. Verificăm fiecare afirmație comparând cu surse sigure și îți arătăm rezultatul cu explicații și surse.',
    ),
    _OnboardingPage(
      icon: Icons.security_rounded,
      title: 'Permisiune microfon',
      body:
          'Pentru a verifica afirmațiile din audio, avem nevoie de acces la microfon. Audio este procesat în timp real și nu este stocat după verificare.',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _next() {
    if (_currentPage < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOut,
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
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemCount: _pages.length,
                itemBuilder: (context, i) => _buildPage(_pages[i]),
              ),
            ),
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(_OnboardingPage page) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Icon in warm container
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.subtle.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(20),
            ),
            child: page.icon == Icons.verified_outlined
                ? Center(
                    child: SvgPicture.asset(
                      'assets/images/logo-accent.svg',
                      width: 36,
                      height: 36,
                    ),
                  )
                : Icon(page.icon, size: 36, color: AppColors.ink),
          ),
          const SizedBox(height: 36),
          Text(
            page.title,
            style: AppTextStyles.headingSection,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          BrandText(
            page.body,
            style: AppTextStyles.bodyLg.copyWith(color: AppColors.mid),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
      child: Row(
        children: [
          _buildDots(),
          const Spacer(),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: _currentPage < 2
                ? AppButton(
                    key: const ValueKey('continue'),
                    label: 'Continuă',
                    size: AppButtonSize.sm,
                    onPressed: _next,
                  )
                : AppButton(
                    key: const ValueKey('start'),
                    label: 'Începe verificarea',
                    variant: AppButtonVariant.accent,
                    size: AppButtonSize.sm,
                    onPressed: _finish,
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildDots() {
    return Row(
      children: List.generate(_pages.length, (i) {
        final isActive = _currentPage == i;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOut,
          margin: const EdgeInsets.only(right: 6),
          width: isActive ? 24 : 6,
          height: 6,
          decoration: BoxDecoration(
            color: isActive ? AppColors.ink : AppColors.subtle,
            borderRadius: BorderRadius.circular(3),
          ),
        );
      }),
    );
  }
}

class _OnboardingPage {
  final IconData icon;
  final String title;
  final String body;
  const _OnboardingPage({
    required this.icon,
    required this.title,
    required this.body,
  });
}
