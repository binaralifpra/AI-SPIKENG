import 'package:intl/intl.dart';

const skills = ['vocabulary', 'speaking', 'grammar', 'listening', 'conversation'];

const skillLabels = {
  'vocabulary': 'Vocabulary',
  'speaking': 'Speaking',
  'grammar': 'Grammar',
  'listening': 'Listening',
  'conversation': 'Conversation',
};

String getTodayString() => DateFormat('yyyy-MM-dd').format(DateTime.now());

Map<String, dynamic> calculateNewDayProgress(Map<String, dynamic> dayProgress) {
  final today = getTodayString();
  final lastPlayed = dayProgress['lastPlayedDate'] as String?;
  final currentDay = dayProgress['currentDay'] as int? ?? 1;

  if (lastPlayed == today) {
    return dayProgress;
  }

  return {
    'currentDay': (currentDay < 30) ? currentDay + 1 : 30,
    'lastPlayedDate': today,
  };
}
