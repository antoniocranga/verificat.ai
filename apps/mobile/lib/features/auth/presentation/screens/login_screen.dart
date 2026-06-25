import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/widgets/widgets.dart';

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
      setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Autentificare')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Verificat',
                  style: Theme.of(context).textTheme.displayLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Autentifică-te pentru a-ți vedea istoricul',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF4D4D4D)),
                ),
                const SizedBox(height: 32),
                AppTextInput(
                  controller: _emailController,
                  hintText: 'Email',
                  onChanged: (_) {},
                ),
                const SizedBox(height: 16),
                AppTextInput(
                  controller: _passwordController,
                  hintText: 'Parolă',
                  obscureText: true,
                  onChanged: (_) {},
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: Color(0xFFEE0000))),
                ],
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: AppSmallPrimaryButton(
                    label: _loading ? 'Se încarcă...' : 'Autentificare',
                    onPressed: _loading ? null : _login,
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
