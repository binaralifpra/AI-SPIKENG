import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

class ChatMessageWidget extends StatelessWidget {
  final String role;
  final String content;
  final bool isStreaming;
  final VoidCallback? onEdit;

  const ChatMessageWidget({
    super.key,
    required this.role,
    required this.content,
    this.isStreaming = false,
    this.onEdit,
  });

  bool get isUser => role == 'user';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(child: Text('AI', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800))),
            ),
            const SizedBox(width: 8),
          ],
          if (isUser && onEdit != null)
            IconButton(
              icon: const Icon(Icons.edit, size: 16, color: Colors.grey),
              onPressed: onEdit,
              splashRadius: 20,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            ),
          Flexible(
            child: Container(
              padding: EdgeInsets.only(
                top: isUser ? 14 : 4,
                bottom: 14,
                left: isUser ? 14 : 4,
                right: isUser ? 14 : 0,
              ),
              decoration: isUser
                  ? BoxDecoration(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(16),
                        topRight: Radius.circular(16),
                        bottomLeft: Radius.circular(16),
                        bottomRight: Radius.circular(4),
                      ),
                    )
                  : null, // AI message has no bubble background
              child: isUser
                  ? Text(content, style: const TextStyle(fontSize: 14))
                  : MarkdownBody(
                      data: content,
                      selectable: true,
                      styleSheet: MarkdownStyleSheet(
                        p: const TextStyle(fontSize: 14, height: 1.6),
                        strong: const TextStyle(fontWeight: FontWeight.w700),
                        tableHead: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                        tableBody: const TextStyle(fontSize: 12),
                        tableBorder: TableBorder.all(
                          color: isDark ? const Color(0xFF2A2D3A) : const Color(0xFFE2E8F0),
                          width: 1,
                        ),
                        tableCellsPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        blockquoteDecoration: BoxDecoration(
                          border: Border(left: BorderSide(color: const Color(0xFF6366F1), width: 3)),
                          color: const Color(0xFF6366F1).withValues(alpha: 0.05),
                        ),
                        code: TextStyle(
                          fontSize: 13,
                          backgroundColor: isDark ? const Color(0xFF2A2D3A) : const Color(0xFFF1F5F9),
                        ),
                      ),
                    ),
            ),
          ),
          if (isUser) const SizedBox(width: 8),
        ],
      ),
    );
  }
}
