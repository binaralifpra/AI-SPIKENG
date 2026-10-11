import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/chat_message.dart';
import '../config/groq_api.dart';
import '../config/prompts.dart';
import '../widgets/chat_message_widget.dart';
import '../widgets/chat_input_widget.dart';
import '../utils/day_tracker.dart';
import '../config/theme.dart';

class TrainingScreen extends StatefulWidget {
  final String skill; // vocabulary, speaking, grammar, listening, conversation
  const TrainingScreen({super.key, required this.skill});

  @override
  State<TrainingScreen> createState() => _TrainingScreenState();
}

class _TrainingScreenState extends State<TrainingScreen> {
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  final ScrollController _scrollController = ScrollController();
  late int _currentDay;
  late String _level;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initChat();
    });
  }

  void _initChat() {
    final auth = context.read<AuthProvider>();
    final userData = auth.userData;
    if (userData == null) return;

    final userName = userData.profile?.name ?? 'User';
    final gender = userData.profile?.gender ?? 'male';
    final language = userData.settings.language;
    _level = userData.getSkillLevel(widget.skill);
    
    final dayProgress = userData.dayProgress[widget.skill];
    _currentDay = dayProgress?.currentDay ?? 1;

    final promptFn = skillPrompts[widget.skill];
    if (promptFn != null) {
      final systemPrompt = promptFn(
        userName: userName,
        gender: gender,
        level: _level,
        day: _currentDay,
        language: language,
      );

      setState(() {
        _messages.add(ChatMessage(role: 'system', content: systemPrompt, hidden: true));
      });

      _sendToApi();
      _updateProgress();
    }
  }

  Future<void> _updateProgress() async {
    final auth = context.read<AuthProvider>();
    final userData = auth.userData;
    if (userData == null) return;

    final dayProgressMap = userData.dayProgress[widget.skill]?.toMap() ?? {};
    final newProgress = calculateNewDayProgress(dayProgressMap);
    
    final today = getTodayString();
    final currentCalendar = userData.calendar;
    var dayActivities = currentCalendar[today]?.activities ?? [];
    if (!dayActivities.contains(widget.skill)) {
      dayActivities.add(widget.skill);
    }

    await auth.updateUserData({
      'dayProgress': {
        ...userData.dayProgress.map((k, v) => MapEntry(k, v.toMap())),
        widget.skill: newProgress,
      },
      'calendar': {
        ...currentCalendar.map((k, v) => MapEntry(k, v.toMap())),
        today: {'activities': dayActivities}
      }
    });
  }

  Future<void> _sendToApi() async {
    setState(() => _isLoading = true);
    
    try {
      final apiMessages = _messages.map((m) => m.toApiMessage()).toList();
      
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

    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: \$e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
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

  String get _title {
    switch (widget.skill) {
      case 'vocabulary': return 'Vocabulary';
      case 'speaking': return 'Speaking';
      case 'grammar': return 'Grammar';
      case 'listening': return 'Listening';
      case 'conversation': return 'Conversation';
      default: return 'Training';
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
    final color = AppColors.getSkillColor(widget.skill);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_title),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Day $_currentDay',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color),
              ),
            ),
          ],
        ),
      ),
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
