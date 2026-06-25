import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';

class HandoffScreen extends StatefulWidget {
  final String token;

  const HandoffScreen({super.key, required this.token});

  @override
  State<HandoffScreen> createState() => _HandoffScreenState();
}

class _HandoffScreenState extends State<HandoffScreen> {
  String _status = 'Se procesează...';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _claimToken();
  }

  Future<void> _claimToken() async {
    const apiBase = String.fromEnvironment('API_URL', defaultValue: 'https://staging.verificat.xyz/api');
    try {
      final client = HttpClient();
      final request = await client.postUrl(Uri.parse('$apiBase/auth/handoff/claim'));
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode({'token': widget.token}));
      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();
      client.close();

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = jsonDecode(body) as Map<String, dynamic>;
        final url = data['url'] as String?;
        if (url != null) {
          setState(() {
            _status = 'Redirecționare către autentificare...';
            _loading = false;
          });
        } else {
          setState(() {
            _status = 'Eroare: linkul de autentificare lipsește';
            _loading = false;
          });
        }
      } else if (response.statusCode == 400) {
        final data = jsonDecode(body) as Map<String, dynamic>;
        setState(() {
          _status = data['message'] as String? ?? 'Linkul a expirat sau a fost deja folosit';
          _loading = false;
        });
      } else {
        setState(() {
          _status = 'Eroare la procesarea linkului';
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _status = 'Eroare de conexiune';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Transfer autentificare')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_loading) const CircularProgressIndicator(),
              const SizedBox(height: 24),
              Text(
                _status,
                style: const TextStyle(fontSize: 16),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}