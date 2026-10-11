class ChatMessage {
  final String role; // 'user' | 'assistant' | 'system'
  final String content;
  final DateTime timestamp;
  final bool hidden;

  ChatMessage({
    required this.role,
    required this.content,
    DateTime? timestamp,
    this.hidden = false,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';
  bool get isSystem => role == 'system';

  Map<String, String> toApiMessage() => {
    'role': role,
    'content': content,
  };
}
