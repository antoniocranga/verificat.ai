import 'dart:async';
import 'dart:convert';
import 'dart:io';
import '../env/env.dart';

class JobApiService {
  final String _baseUrl;
  final HttpClient _client;

  JobApiService({String? baseUrl, HttpClient? client})
    : _baseUrl = baseUrl ?? AppEnv.apiUrl,
      _client = client ?? HttpClient();

  Future<Map<String, dynamic>> uploadAudio(File audioFile) async {
    final uri = Uri.parse('$_baseUrl/jobs/upload');
    final request = await _client.postUrl(uri);

    request.headers.set('Content-Type', 'audio/mp4');
    request.contentLength = await audioFile.length();

    final audioBytes = await audioFile.readAsBytes();
    request.add(audioBytes);
    await request.close();

    final response = await request.done;
    final body = await response.transform(utf8.decoder).join();

    if (response.statusCode != 202) {
      throw HttpException(
        'Upload failed: ${response.statusCode} $body',
        uri: uri,
      );
    }

    return jsonDecode(body) as Map<String, dynamic>;
  }

  Stream<Map<String, dynamic>> streamJobEvents(String jobId) {
    final uri = Uri.parse('$_baseUrl/jobs/$jobId/stream');
    final controller = StreamController<Map<String, dynamic>>();

    _client.getUrl(uri).then((request) {
      request.headers.set('Accept', 'text/event-stream');
      return request.close();
    }).then((response) {
      response
        .transform(utf8.decoder)
        .transform(const LineSplitter())
        .listen(
          (line) {
            if (line.startsWith('data: ')) {
              try {
                final data = jsonDecode(line.substring(6)) as Map<String, dynamic>;
                controller.add(data);
              } catch (_) {}
            }
          },
          onError: (error) => controller.addError(error),
          onDone: () => controller.close(),
        );
    }).catchError((error) {
      controller.addError(error);
    });

    return controller.stream;
  }
}
