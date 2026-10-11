import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/chat_message.dart';
import '../config/groq_api.dart';
import '../config/prompts.dart';
import '../utils/cefr_levels.dart';
import '../widgets/chat_message_widget.dart';
import '../widgets/chat_input_widget.dart';
import '../utils/day_tracker.dart';

class TestScreen extends StatefulWidget {
  const TestScreen({super.key});

  @override
  State<TestScreen> createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initChat();
    });
  }

  void _initChat() {
    final userData = context.read<AuthProvider>().userData;
    final userName = userData?.profile?.name ?? 'User';
    final gender = userData?.profile?.gender ?? 'male';
    final language = userData?.settings.language ?? 'hybrid';

    final systemPrompt = getTestPrompt(
      userName: userName,
      gender: gender,
      language: language,
    );

    setState(() {
      _messages.add(ChatMessage(role: 'system', content: systemPrompt, hidden: true));
    });

    _sendToApi();
  }

  Future<void> _sendToApi() async {
    setState(() => _isLoading = true);
    
    try {
      final apiMessages = _messages.map((m) => m.toApiMessage()).toList();
      
      // We will use streaming
      String currentContent = '';
      _messages.add(ChatMessage(role: 'assistant', content: currentContent));
      final assistantIndex = _messages.length - 1;

      await for (final chunk in GroqApi.chatStream(apiMessages)) {
        if (!mounted) break;
        setState(() {
          _messages[assistantIndex] = ChatMessage(role: 'assistant', content: chunk);
        });
        _scrollToBottom();
        currentContent = chunk;
      }
      
      _checkCefrResults(currentContent);

    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: \$e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _checkCefrResults(String text) async {
    final results = parseCefrFromResponse(text);
    if (results != null) {
      final auth = context.read<AuthProvider>();
      
      // Update Firestore
      final today = getTodayString();
      final currentCalendar = auth.userData?.calendar ?? {};
      var dayActivities = currentCalendar[today]?.activities ?? [];
      if (!dayActivities.contains('test')) {
        dayActivities.add('test');
      }

      await auth.updateUserData({
        'cefrLevels': results,
        'testCompleted': true,
        'calendar': {
          ...currentCalendar.map((k, v) => MapEntry(k, v.toMap())),
          today: {'activities': dayActivities}
        }
      });

      if (!mounted) return;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Tes Selesai! 🎉'),
          content: const Text('Kemampuan bahasamu telah diukur. Sekarang kamu bisa memulai latihan harian!'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context); // close dialog
                Navigator.pop(context); // go back to dashboard
              },
              child: const Text('Kembali ke Dashboard'),
            )
          ],
        ),
      );
    }
  }

  void _handleSend(String text) {
    setState(() {
      _messages.add(ChatMessage(role: 'user', content: text));
    });
    _scrollToBottom();
    _sendToApi();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 100,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _editMessage(int index) {
    if (_isLoading) return;
    final messageToEdit = _messages[index].content;
    final editController = TextEditingController(text: messageToEdit);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Pesan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: editController,
          maxLines: 5,
          minLines: 1,
          decoration: const InputDecoration(border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              final newText = editController.text.trim();
              if (newText.isEmpty) return;

              setState(() {
                _messages.removeRange(index, _messages.length);
              });
              _handleSend(newText);
            },
            child: const Text('Kirim Ulang'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final visibleMessages = _messages.where((m) => !m.hidden).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('CEFR Test')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(vertical: 16),
              itemCount: visibleMessages.length,
              itemBuilder: (context, index) {
                final msg = visibleMessages[index];
                final realIndex = _messages.indexWhere((m) => identical(m, msg));
                
                return ChatMessageWidget(
                  role: msg.role,
                  content: msg.content,
                  isStreaming: _isLoading && index == visibleMessages.length - 1 && msg.role == 'assistant',
                  onEdit: msg.role == 'user' ? () => _editMessage(realIndex) : null,
                );
              },
            ),
          ),
          ChatInputWidget(
            onSend: _handleSend,
            isLoading: _isLoading,
          ),
        ],
      ),
    );
  }
}
