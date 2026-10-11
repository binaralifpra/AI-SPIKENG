import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ChatInputWidget extends StatefulWidget {
  final Function(String) onSend;
  final bool isLoading;
  const ChatInputWidget({super.key, required this.onSend, this.isLoading = false});

  @override
  State<ChatInputWidget> createState() => _ChatInputWidgetState();
}

class _ChatInputWidgetState extends State<ChatInputWidget> {
  final _controller = TextEditingController();
  final _speech = stt.SpeechToText();
  bool _isListening = false;
  bool _speechAvailable = false;
  
  bool _shouldBeListening = false;
  String _previousText = '';

  @override
  void initState() {
    super.initState();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    _speechAvailable = await _speech.initialize(
      onError: (e) {
        if (_shouldBeListening) {
          Future.delayed(const Duration(milliseconds: 100), () {
            if (_shouldBeListening) _startListening();
          });
        } else {
          setState(() => _isListening = false);
        }
      },
      onStatus: (s) {
        if (s == 'done' || s == 'notListening') {
          if (_shouldBeListening) {
            Future.delayed(const Duration(milliseconds: 100), () {
              if (_shouldBeListening) _startListening();
            });
          } else {
            setState(() => _isListening = false);
          }
        }
      },
    );
    setState(() {});
  }

  void _startListening() {
    final langPref = context.read<AuthProvider>().userData?.settings.language ?? 'hybrid';
    final locale = langPref == 'english' ? 'en-US' : 'id-ID';

    _previousText = _controller.text;
    if (_previousText.isNotEmpty && !_previousText.endsWith(' ')) {
      _previousText += ' ';
    }

    _speech.listen(
      onResult: (result) {
        setState(() {
          _controller.text = _previousText + result.recognizedWords;
        });
      },
      partialResults: true,
      localeId: locale,
    );
    if (!_isListening) setState(() => _isListening = true);
  }

  void _toggleRecording() {
    if (_isListening || _shouldBeListening) {
      _shouldBeListening = false;
      _speech.stop();
      setState(() => _isListening = false);
    } else {
      _shouldBeListening = true;
      _startListening();
    }
  }

  void _send() {
    final text = _controller.text.trim();
    if (text.isEmpty || widget.isLoading) return;
    if (_isListening) {
      _speech.stop();
      setState(() => _isListening = false);
    }
    widget.onSend(text);
    _controller.clear();
  }

  @override
  void dispose() {
    _controller.dispose();
    _speech.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1117) : Colors.white,
        border: Border(top: BorderSide(color: isDark ? const Color(0xFF2A2D3A) : const Color(0xFFE2E8F0))),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                // Mic button
                if (_speechAvailable)
                  GestureDetector(
                    onTap: widget.isLoading ? null : _toggleRecording,
                    child: Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _isListening ? Colors.red.withValues(alpha: 0.15) : const Color(0xFF6366F1).withValues(alpha: 0.1),
                      ),
                      child: Icon(
                        _isListening ? Icons.stop : Icons.mic,
                        color: _isListening ? Colors.red : const Color(0xFF6366F1),
                        size: 22,
                      ),
                    ),
                  ),
                const SizedBox(width: 8),
                // Text field
                Expanded(
                  child: TextField(
                    controller: _controller,
                    maxLines: 4,
                    minLines: 1,
                    enabled: !widget.isLoading,
                    decoration: InputDecoration(
                      hintText: _isListening ? 'Listening... Speak now' : 'Type a message...',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                      filled: true,
                      fillColor: isDark ? const Color(0xFF1A1D27) : const Color(0xFFF1F5F9),
                    ),
                    onSubmitted: (_) => _send(),
                    textInputAction: TextInputAction.send,
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
                const SizedBox(width: 8),
                // Send button
                GestureDetector(
                  onTap: _send,
                  child: Container(
                    width: 44, height: 44,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
                    ),
                    child: const Icon(Icons.send, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
            if (_isListening) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red)),
                  const SizedBox(width: 6),
                  const Text('Recording...', style: TextStyle(fontSize: 12, color: Colors.red)),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
