import 'dart:convert';
import 'dart:io';

class VerdictApiService {
  final String _baseUrl;
  final HttpClient _client;

  VerdictApiService({
    String? baseUrl,
    HttpClient? client,
  }) : _baseUrl = baseUrl ?? 'https://staging.verificat.xyz/api',
       _client = client ?? HttpClient();

  Future<Map<String, dynamic>> searchVerdicts({
    String query = '',
    int page = 1,
    int limit = 20,
    String? token,
  }) async {
    final uri = Uri.parse('$_baseUrl/fact-checks/search').replace(
      queryParameters: {
        'q': query,
        'page': page.toString(),
        'limit': limit.toString(),
      },
    );
    return _get(uri, token: token);
  }

  Future<Map<String, dynamic>> getLatestChecks({String? token}) async {
    return _get(Uri.parse('$_baseUrl/fact-checks'), token: token);
  }

  Future<Map<String, dynamic>> getVerdict(String id, {String? token}) async {
    return _get(Uri.parse('$_baseUrl/fact-checks/$id'), token: token);
  }

  Future<Map<String, dynamic>> _get(Uri uri, {String? token}) async {
    final request = await _client.getUrl(uri);
    request.headers.contentType = ContentType.json;
    if (token != null) {
      request.headers.set('Authorization', 'Bearer $token');
    }
    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    if (response.statusCode >= 400) {
      throw HttpException('GET $uri failed: ${response.statusCode}', uri: uri);
    }
    return jsonDecode(body) as Map<String, dynamic>;
  }
}
