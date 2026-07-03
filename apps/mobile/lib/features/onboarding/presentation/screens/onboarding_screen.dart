import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/brand_text.dart';
import 'package:flutter_svg/flutter_svg.dart';

enum ListenStyle { liveBroadcasts, conversations, podcasts, all }

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const OnboardingScreen({super.key, required this.onComplete});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _step = 0;
  ListenStyle? _selectedStyle;

  void _advance() {
    final next = _step + 1;
    if (next < 4) {
      setState(() => _step = next);
    } else if (next == 4) {
      _requestMic();
    }
  }

  void _skipToEnd() {
    _requestMic();
  }

  Future<void> _requestMic() async {
    await Permission.microphone.request();
    await _storePreference();
    widget.onComplete();
  }

  Future<void> _storePreference() async {
    final prefs = await SharedPreferences.getInstance();
    if (_selectedStyle != null) {
      await prefs.setString('listen-style', _selectedStyle!.name);
    }
    await prefs.setBool('tutorial-shown', false);
  }

  @override
  Widget build(BuildContext context) {
    if (_step < 2) {
      return _buildCarouselStep();
    }
    return _buildScreenStep();
  }

  // ─── Step 1: Welcome carousel ─────────────────────────────────────

  int _carouselIndex = 0;

  Widget _buildCarouselStep() {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: _skipToEnd,
                child: Text(
                  'Sari peste',
                  style: AppTextStyles.labelMd.copyWith(color: AppColors.mid),
                ),
              ),
            ),
            Expanded(
              child: PageView(
                onPageChanged: (i) => setState(() => _carouselIndex = i),
                children: [
                  _buildCarouselCard(
                    icon: Icons.verified_outlined,
                    title: 'Află adevărul\nîn timp real',
                    body: 'verificat.xyz identifică afirmațiile false\nchiar în timp ce vorbești. Fără căutări manuale — primești răspunsuri instant.',
                    showLogo: true,
                  ),
                  _buildCarouselCard(
                    icon: Icons.shield_outlined,
                    title: 'Verificare\nîn direct',
                    body: 'O declarație dubioasă în timpul unui podcast?\nO știre suspectă la radio? Noi verificăm pe loc.',
                    showLogo: false,
                  ),
                ],
              ),
            ),
            _buildCarouselFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildCarouselCard({
    required IconData icon,
    required String title,
    required String body,
    required bool showLogo,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.subtle.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(20),
            ),
            child: showLogo
                ? Center(
                    child: SvgPicture.asset(
                      'assets/images/logo-accent.svg',
                      width: 36,
                      height: 36,
                    ),
                  )
                : Icon(icon, size: 36, color: AppColors.ink),
          ),
          const SizedBox(height: 36),
          Text(
            title,
            style: AppTextStyles.headingSection,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          BrandText(
            body,
            style: AppTextStyles.bodyLg.copyWith(color: AppColors.mid),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildCarouselFooter() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
      child: Row(
        children: [
          Row(
            children: List.generate(2, (i) {
              final isActive = _carouselIndex == i;
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
          ),
          const Spacer(),
          AppButton(
            label: _carouselIndex == 0 ? 'Continuă' : 'Alege preferințele',
            size: AppButtonSize.sm,
            onPressed: () {
              if (_carouselIndex == 0) {
                setState(() => _carouselIndex = 1);
              } else {
                setState(() => _step = 2);
              }
            },
          ),
        ],
      ),
    );
  }

  // ─── Step 2: Listen style ────────────────────────────────────────

  Widget _buildScreenStep() {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => setState(() => _step = _step == 3 ? 2 : 1),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_step == 2) Expanded(child: _buildListenStyleStep()),
              if (_step == 3) Expanded(child: _buildMicContextStep()),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildListenStyleStep() {
    final options = [
      (ListenStyle.liveBroadcasts, Icons.wifi_tethering, 'Emisiuni live', 'Știri, dezbateri și emisiuni radio în direct'),
      (ListenStyle.conversations, Icons.chat_rounded, 'Conversații', 'Discuții informale și întâlniri'),
      (ListenStyle.podcasts, Icons.headphones_rounded, 'Podcasturi', 'Podcasturi și emisiuni înregistrate'),
      (ListenStyle.all, Icons.explore_rounded, 'Toate', 'Indiferent de context — lasă aplicația să decidă'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        const MonoEyebrow(label: 'PASUL 2 DIN 4'),
        const SizedBox(height: 12),
        Text(
          'Alege stilul\ntău de ascultare',
          style: AppTextStyles.headingSection.copyWith(fontSize: 28),
        ),
        const SizedBox(height: 8),
        Text(
          'Ne ajuți să îți personalizăm sugestiile. Poți schimba oricând din setări.',
          style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid, height: 1.65),
        ),
        const SizedBox(height: 24),
        ...options.map(
          (o) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _StyleCard(
              icon: o.$2,
              title: o.$3,
              subtitle: o.$4,
              selected: _selectedStyle == o.$1,
              onTap: () {
                setState(() => _selectedStyle = o.$1);
                HapticFeedback.lightImpact();
              },
            ),
          ),
        ),
        const Spacer(),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Row(
              children: [
                AppButton.secondary(
                  label: 'Sari peste',
                  size: AppButtonSize.sm,
                  onPressed: _advance,
                ),
                const SizedBox(width: 12),
                AppButton(
                  label: 'Continuă',
                  variant: _selectedStyle != null ? AppButtonVariant.accent : AppButtonVariant.primary,
                  size: AppButtonSize.sm,
                  onPressed: _advance,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ─── Step 3: Mic context ─────────────────────────────────────────

  Widget _buildMicContextStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        const MonoEyebrow(label: 'PASUL 3 DIN 4'),
        const SizedBox(height: 12),
        Text(
          'De ce avem nevoie\nde microfon?',
          style: AppTextStyles.headingSection.copyWith(fontSize: 28),
        ),
        const SizedBox(height: 24),
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.subtle.withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(Icons.mic_rounded, size: 36, color: AppColors.ink),
        ),
        const SizedBox(height: 24),
        BrandText(
          'Audio-ul tău este procesat în timp real și nu este stocat după verificare. Nu ascultăm conversațiile private — analizăm doar afirmațiile factuale.\n\nPoți folosi și modul Înregistrare, unde tu controlezi când pornești și oprești captura.',
          style: AppTextStyles.bodyLg.copyWith(color: AppColors.mid, height: 1.7),
        ),
        const Spacer(),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Row(
              children: [
                AppButton.secondary(
                  label: 'Sari peste',
                  size: AppButtonSize.sm,
                  onPressed: _skipToEnd,
                ),
                const SizedBox(width: 12),
                AppButton.accent(
                  label: 'Permite microfonul',
                  size: AppButtonSize.sm,
                  onPressed: _skipToEnd,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StyleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  const _StyleCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.accent.withValues(alpha: 0.08) : AppColors.surfaceRaised,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AppColors.accent : AppColors.subtle,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 22, color: selected ? AppColors.accent : AppColors.ink),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.labelLg.copyWith(
                      fontWeight: FontWeight.w600,
                      color: selected ? AppColors.accent : AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: AppTextStyles.bodySm.copyWith(color: AppColors.mid),
                  ),
                ],
              ),
            ),
            if (selected)
              const Icon(Icons.check_circle, size: 20, color: AppColors.accent),
          ],
        ),
      ),
    );
  }
}
