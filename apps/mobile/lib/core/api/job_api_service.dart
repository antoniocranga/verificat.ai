import 'dart:async';
import 'dart:convert';
import 'dart:io';
import '../env/env.dart';

class JobApiService {
  final String _baseUrl;
  final HttpClient _client;

  JobApiService({String? baseUrl, HttpClient? client})
      : _baseUrl = baseUrl ?? AppEnv.apiUrl,
        _client = (client ?? HttpClient())
          ..connectionTimeout = const Duration(seconds: 10)
          ..idleTimeout = const Duration(seconds: 30);

  Future<Map<String, dynamic>> uploadAudio(File audioFile) async {
    final uri = Uri.parse('$_baseUrl/jobs/upload');
    final request = await _client.postUrl(uri);

    request.headers.set('Content-Type', 'audio/mp4');
    request.contentLength = await audioFile.length();

    final audioBytes = await audioFile.readAsBytes();
    request.add(audioBytes);
    await request.close();

    final response = await request.done.timeout(const Duration(seconds: 30));
    final body = await response.transform(utf8.decoder).join();

    if (response.statusCode != 202) {
      throw HttpException(
        'Upload failed: ${response.statusCode} $body',
        uri: uri,
      );
    }

    return jsonDecode(body) as Map<String, dynamic>;
  }

  Stream<Map<String, dynamic>> streamJobEvents(String jobId) async* {
    final uri = Uri.parse('$_baseUrl/jobs/$jobId/stream');
    try {
      final request = await _client.getUrl(uri);
      request.headers.set('Accept', 'text/event-stream');
      final response = await request.close();

      String lastEventType = '';
      String dataBuffer = '';
      await for (final chunk in response.transform(utf8.decoder)) {
        dataBuffer += chunk;
        while (dataBuffer.contains('\n')) {
          final idx = dataBuffer.indexOf('\n');
          final line = dataBuffer.substring(0, idx).trimRight();
          dataBuffer = dataBuffer.substring(idx + 1);

          if (line.startsWith('event: ')) {
            lastEventType = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            final data = line.substring(6);
            try {
              final parsed = jsonDecode(data) as Map<String, dynamic>;
              if (lastEventType == 'completed') {
                yield {'type': 'completed', ...parsed};
              } else if (lastEventType == 'failed') {
                yield {'type': 'failed', 'message': data};
              } else if (lastEventType == 'progress') {
                yield {'type': 'progress', ...parsed};
              }
            } catch (_) {}
          } else if (line.isEmpty && lastEventType == 'completed') {
            // Handle case where completed is followed by data in next event
          }
        }
      }
    } catch (_) {}
  }
}
