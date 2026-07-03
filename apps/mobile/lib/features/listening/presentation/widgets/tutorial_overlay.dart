import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';

class TutorialOverlay extends StatefulWidget {
  final Widget child;
  final VoidCallback onDismissed;

  const TutorialOverlay({
    super.key,
    required this.child,
    required this.onDismissed,
  });

  @override
  State<TutorialOverlay> createState() => _TutorialOverlayState();
}

class _TutorialOverlayState extends State<TutorialOverlay>
    with SingleTickerProviderStateMixin {
  int _currentStep = 0;
  late AnimationController _pulseController;

  static const _steps = [
    _TutorialStep(
      title: 'Alege modul',
      description: 'Comută între fluxul în timp real și înregistrarea manuală.',
      topFraction: 0.04,
    ),
    _TutorialStep(
      title: 'Pornește verificarea',
      description: 'Atinge butonul pentru a începe. Verifică orice afirmație pe loc.',
      topFraction: 0.48,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _dismiss() {
    widget.onDismissed();
    SharedPreferences.getInstance().then((prefs) {
      prefs.setBool('tutorial-shown', true);
    });
  }

  void _next() {
    if (_currentStep < _steps.length - 1) {
      setState(() => _currentStep++);
    } else {
      _dismiss();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        GestureDetector(
          onTap: _next,
          child: Container(
            color: Colors.black54,
            child: Stack(
              children: [
                Positioned(
                  top: MediaQuery.of(context).size.height * _steps[_currentStep].topFraction,
                  left: 0,
                  right: 0,
                  child: Column(
                    children: [
                      const SizedBox(height: 100),
                      AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, _) {
                          return Transform.scale(
                            scale: 1.0 + (_pulseController.value * 0.08),
                            child: Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.9),
                                  width: 2.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.accent.withValues(alpha: 0.3 * _pulseController.value),
                                    blurRadius: 20,
                                    spreadRadius: 4,
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 40),
                        child: Column(
                          children: [
                            Text(
                              _steps[_currentStep].title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w600,
                                fontFamily: 'Poppins',
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _steps[_currentStep].description,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                                fontFamily: 'Lora',
                                height: 1.6,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Atinge pentru a continua',
                          style: AppTextStyles.labelSm.copyWith(color: Colors.white70),
                        ),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  top: MediaQuery.of(context).size.height * 0.06,
                  right: 16,
                  child: TextButton(
                    onPressed: _dismiss,
                    child: const Text(
                      'Sari peste',
                      style: TextStyle(color: Colors.white60),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TutorialStep {
  final String title;
  final String description;
  final double topFraction;

  const _TutorialStep({
    required this.title,
    required this.description,
    required this.topFraction,
  });
}
