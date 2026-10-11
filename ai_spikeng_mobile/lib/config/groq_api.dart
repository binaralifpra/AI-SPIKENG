import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class GroqApi {
  static const String _apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  static const String _model = 'llama-3.3-70b-versatile';

  static String get _apiKey => dotenv.env['GROQ_API_KEY'] ?? '';

  static Future<String> chat(List<Map<String, String>> messages) async {
    final response = await http.post(
      Uri.parse(_apiUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_apiKey',
      },
      body: jsonEncode({
        'model': _model,
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 4096,
        'stream': false,
      }),
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(error['error']?['message'] ?? 'API error: ${response.statusCode}');
    }

    final data = jsonDecode(response.body);
    return data['choices'][0]['message']['content'] as String;
  }

  /// Streaming chat - yields partial content as it arrives
  static Stream<String> chatStream(List<Map<String, String>> messages) async* {
    final request = http.Request('POST', Uri.parse(_apiUrl));
    request.headers.addAll({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $_apiKey',
    });
    request.body = jsonEncode({
      'model': _model,
      'messages': messages,
      'temperature': 0.7,
      'max_tokens': 4096,
      'stream': true,
    });

    final client = http.Client();
    try {
      final response = await client.send(request);

      if (response.statusCode != 200) {
        throw Exception('API error: ${response.statusCode}');
      }

      String fullContent = '';
      await for (final chunk in response.stream.transform(utf8.decoder)) {
        final lines = chunk.split('\n').where((l) => l.trim().startsWith('data: '));
        for (final line in lines) {
          final data = line.replaceFirst('data: ', '').trim();
          if (data == '[DONE]') continue;

          try {
            final parsed = jsonDecode(data);
            final content = parsed['choices']?[0]?['delta']?['content'] ?? '';
            fullContent += content;
            yield fullContent;
          } catch (_) {
            // Skip malformed JSON chunks
          }
        }
      }
    } finally {
      client.close();
    }
  }
}
