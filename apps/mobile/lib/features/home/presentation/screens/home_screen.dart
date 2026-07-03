import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/brand_text.dart';
import 'package:flutter_svg/flutter_svg.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 80,
                height: 80,
                child: Center(
                  child: SvgPicture.asset(
                    'assets/images/logo-accent.svg',
                    width: 40,
                    height: 40,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const BrandText('VerificatAI',
                  style: AppTextStyles.headingSection),
              const SizedBox(height: 8),
              const Text(
                'Verifică informațiile cu încredere',
                style: AppTextStyles.bodyMd,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 36),
              SizedBox(
                width: double.infinity,
                child: AppButton.accent(
                  label: 'Verifică acum',
                  onPressed: () => context.go('/listen'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
