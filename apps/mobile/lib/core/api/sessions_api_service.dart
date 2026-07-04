import 'dart:convert';
import 'dart:io';
import '../env/env.dart';

class SessionsApiService {
  final String _baseUrl;
  final HttpClient _client;

  SessionsApiService({
    String? baseUrl,
    HttpClient? client,
  }) : _baseUrl = baseUrl ?? AppEnv.apiUrl,
       _client = client ?? HttpClient();

  Future<Map<String, dynamic>> listSessions({
    int page = 1,
    int limit = 20,
  }) async {
    final uri = Uri.parse('$_baseUrl/sessions').replace(
      queryParameters: {
        'page': page.toString(),
        'limit': limit.toString(),
      },
    );
    return _get(uri);
  }

  Future<Map<String, dynamic>> getSession(String id) async {
    return _get(Uri.parse('$_baseUrl/sessions/$id'));
  }

  Future<void> deleteSession(String id) async {
    final uri = Uri.parse('$_baseUrl/sessions/$id');
    final request = await _client.deleteUrl(uri);
    final response = await request.close();
    if (response.statusCode >= 400) {
      throw HttpException('DELETE $uri failed: ${response.statusCode}', uri: uri);
    }
  }

  Future<Map<String, dynamic>> _get(Uri uri) async {
    final request = await _client.getUrl(uri);
    request.headers.contentType = ContentType.json;
    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    if (response.statusCode >= 400) {
      throw HttpException('GET $uri failed: ${response.statusCode}', uri: uri);
    }
    return jsonDecode(body) as Map<String, dynamic>;
  }
}
