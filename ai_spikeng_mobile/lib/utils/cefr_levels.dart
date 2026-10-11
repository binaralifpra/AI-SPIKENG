const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const cefrLabels = {
  'A1': 'Beginner',
  'A2': 'Elementary',
  'B1': 'Intermediate',
  'B2': 'Upper Intermediate',
  'C1': 'Advanced',
  'C2': 'Proficient',
};

const cefrDescriptions = {
  'A1': 'Kamu bisa memahami dan menggunakan ekspresi sehari-hari yang sangat dasar.',
  'A2': 'Kamu bisa berkomunikasi dalam situasi sederhana dan rutin sehari-hari.',
  'B1': 'Kamu bisa menangani sebagian besar situasi saat bepergian dan menulis teks sederhana.',
  'B2': 'Kamu bisa berinteraksi dengan lancar dan spontan dengan penutur asli.',
  'C1': 'Kamu bisa menggunakan bahasa secara fleksibel dan efektif untuk tujuan sosial dan profesional.',
  'C2': 'Kamu bisa memahami hampir semua yang didengar atau dibaca dengan mudah.',
};

String? getNextLevel(String currentLevel) {
  final index = cefrLevels.indexOf(currentLevel);
  if (index == -1 || index >= cefrLevels.length - 1) return null;
  return cefrLevels[index + 1];
}

Map<String, String>? parseCefrFromResponse(String text) {
  final match = RegExp(r'\[CEFR_RESULTS\]([\s\S]*?)\[\/CEFR_RESULTS\]', caseSensitive: false)
      .firstMatch(text);
  if (match == null) return null;

  final results = <String, String>{};
  final lines = match.group(1)!.trim().split('\n');
  for (var line in lines) {
    line = line.replaceAll(RegExp(r'[*`]'), '').trim();
    if (line.isEmpty) continue;

    final parts = line.split(':').map((s) => s.trim()).toList();
    if (parts.length >= 2) {
      final skill = parts[0].toLowerCase();
      final levelMatch = RegExp(r'(A1|A2|B1|B2|C1|C2)', caseSensitive: false)
          .firstMatch(parts[1]);
      if (levelMatch != null) {
        results[skill] = levelMatch.group(1)!.toUpperCase();
      }
    }
  }

  return results.isNotEmpty ? results : null;
}
