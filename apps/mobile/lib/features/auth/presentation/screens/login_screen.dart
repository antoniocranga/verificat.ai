import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/brand_text.dart';

class LoginScreen extends StatefulWidget {
  final String? error;

  const LoginScreen({super.key, this.error});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _error;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _error = widget.error;
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await Supabase.instance.client.auth.signInWithPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
    } on AuthException catch (e) {
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        leading: const BackButton(),
        title: const Text('Autentificare'),
        backgroundColor: AppColors.canvas,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo / wordmark
                BrandText(
                  'verificat.xyz',
                  style: AppTextStyles.headingDisplay.copyWith(fontSize: 32),
                ),
                const SizedBox(height: 8),
                Text(
                  'Autentifică-te pentru a-ți vedea istoricul',
                  style: AppTextStyles.bodyMd.copyWith(color: AppColors.mid),
                ),
                const SizedBox(height: 40),

                // Email field
                AppTextInput(
                  controller: _emailController,
                  label: 'Adresă email',
                  hintText: 'tu@exemplu.ro',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  errorText: null,
                ),
                const SizedBox(height: 16),

                // Password field
                AppTextInput(
                  controller: _passwordController,
                  label: 'Parolă',
                  hintText: '••••••••',
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  onEditingComplete: _loading ? null : _login,
                ),

                // Error message
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 13,
                      color: AppColors.error,
                    ),
                  ),
                ],

                const SizedBox(height: 24),

                // Submit button
                SizedBox(
                  width: double.infinity,
                  child: AppButton(
                    label: 'Autentificare',
                    onPressed: _loading ? null : _login,
                    loading: _loading,
                    width: double.infinity,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
