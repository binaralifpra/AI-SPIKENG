// ============================================
// AI-SPIKENG — Prompt Templates (Dart)
// Ported from prompts.js
// ============================================

const vocabularyTopics = [
  'Daily Routines', 'Family & People', 'Food & Drinks', 'Jobs & Workplaces',
  'Places in Town', 'Common Actions', 'Feelings & Emotions', 'Shopping & Money',
  'Transportation', 'Time & Calendar', 'Health & Body', 'House & Furniture',
  'Weather', 'Basic Descriptions', 'Travel & Holidays', 'Ordering Food',
  'Technology & Gadgets', 'School & Learning', 'Describing Places', 'Describing People',
  'Hobbies & Free Time', 'Common Collocations', 'Phrasal Verbs (Everyday Life)',
  'Phrasal Verbs (Work & Study)', 'Expressing Opinions', 'Advanced Feelings & Emotions',
  'Business Basics', 'Idioms for Daily Situations', 'Transition Words for Speaking', 'Business Talk',
];

const speakingTopics = [
  'Introducing Yourself', 'Asking Questions', 'Talking About Daily Routines',
  'Describing People', 'Describing Things Around You', 'Talking About Time',
  'Likes and Dislikes', 'Giving Directions', 'Ordering Food and Drinks',
  'Making Small Talk', 'Talking About Past Experiences', 'Talking About Future Plans',
  'Describing Places', 'Talking About Frequency', 'Giving Opinions',
  'Agreeing and Disagreeing', 'Making Suggestions', 'Making Invitations',
  'Apologizing and Responding', 'Offering Help', 'Talking About Problems and Solutions',
  'Explaining Something Clearly', 'Comparing People, Things, and Places',
  'Telling a Short Story', 'Giving Instructions (How to...)',
  'Making Complaints Politely', 'Talking About Expectations',
  'Talking About Habits (Past & Present)', 'Talking About Preferences', 'Mini Presentation',
];

const grammarTopics = [
  'Kata Benda (noun)', 'Kata Sifat (adjective)', 'Verb 1 (Sehari2)',
  'Kapan pakai Verb s/es', 'Verb 2 (tadi/kemarin/masa lalu)',
  'Verb 1 VS Verb 2', 'Do/does/did', 'Is/am/are VS Was/were',
  'Do/does VS Is/am/are', 'V-Ing (sedang)', 'Did VS was/were',
  'Verb 3 (sudah terjadi)', 'Verb 2 VS Verb 3', 'Kapan pakai be',
  'Kapan pakai been', 'Have been + Ving', 'used to + verb 1',
  'Is/am/are + used to + Ving', 'Will (akan/masa depan)', 'Will VS Going to',
  'Have to VS Must', 'Should have + Verb 3', 'If I were, I would',
  '5 W + 1 H', 'Could, Would, Should', 'Kalimat passive',
  'Transition Words', 'Who VS Whom', 'Which & Whose',
  'Lebih & Paling - Comparative and superlative',
];

const listeningTopics = [
  'My Morning Routine Story', 'How I Spent My Weekend', 'A Person I Admire',
  'My Favorite Place in My City', 'A Simple Memory From School', 'My Daily Life at Home',
  'A Short Story About pet', 'My First Day at Work or School',
  'A Time I Got Lost in a New Place', 'A Meal I Will Never Forget',
  'Unexpected Happened', 'My Next Plan or Goal', 'A Time I Felt Sick and What I Did',
  'A Problem I Solved on My Own', 'My Most Memorable Trip',
  'The Best Gift I Ever Received', 'A Funny or Embarrassing Moment',
  'A Challenge I Faced', 'A Hobby that I Love', 'A Friend Who Helped Me',
  'A Special Event I Attended', 'A Day That Changed My Life',
  'My Personal Success Story', 'What I Learned From a Mistake',
  'How I Organize My Day', 'A Project I Completed',
  'How I Deal With Stress or Pressure', 'Meeting Someone New',
  'A Dream or Ambition That I Have', 'A lesson from A past story',
];

const conversationTopics = [
  'Meeting New People', 'Talking About Days', 'Weekend Activity Plans',
  'Discussing the Weather', 'Movie or Series Talk', 'Asking About Hobbies',
  'Borrowing Household Items', 'Transportation Plan Talk', 'Comparing Product Choices',
  'Simple Etiquette Talk', 'Delivery Problem Help', 'Room/Apartment Inquiry',
  'Community Event Talk', 'Reacting to News', 'Sharing Achievements',
  'Daily Problem Advice', 'Group Activity Planning', 'How-To Explanation',
  'Conversation Follow-Up', 'Health & Wellness Talk', 'Giving Helpful Suggestions',
  'Talking About Feelings', 'Making Simple Complaints', 'Telling Short Stories',
  'Asking About Experiences', 'Discussing Future Plans', 'Asking for Clarification',
  'Handling Misunderstandings', 'Solving Small Conflicts', 'Ordering Coffee Drinks',
];

String getTopicForDay(String skill, int day) {
  final dayIndex = (day - 1).clamp(0, 29);
  switch (skill) {
    case 'vocabulary': return vocabularyTopics[dayIndex];
    case 'speaking': return speakingTopics[dayIndex];
    case 'grammar': return grammarTopics[dayIndex];
    case 'listening': return listeningTopics[dayIndex];
    case 'conversation': return conversationTopics[dayIndex];
    default: return '';
  }
}

const correctionInstruction = '''

INSTRUKSI KOREKSI WAJIB:
- Awali setiap percakapan atau sesi baru dengan perkenalan dirimu: "Halo, aku AI-SPIKENG, tutor bahasa Inggrismu!" (atau variasi serupa yang ramah).
- Jika user melakukan kesalahan grammar, typo, atau mencampur bahasa (contoh: "I want to pergi"), KAMU WAJIB MENGOREKSINYA SECARA KESELURUHAN.
- Berikan penjabaran koreksi yang SANGAT RAPI, DETAIL, dan EDUKATIF. Gunakan markdown dengan baik (bullet points, bold, italic). Jangan menggunakan kata-kata yang membingungkan.
- Koreksi jawaban user WAJIB berupa perbaikan kalimat dalam BAHASA INGGRIS (English), bukan menerjemahkan jawaban ke Bahasa Indonesia.
- KAMU WAJIB MENGGUNAKAN FORMAT TABEL KOREKSI 3 KOLOM SEPERTI INI:

(WAJIB ADA BARIS KOSONG / ENTER SEBELUM TABEL)
| Kalimat Kamu | Koreksi (English) | Penjelasan Detail (Indonesia) |
|---|---|---|
| [kalimat 1 yg salah] | [koreksi kalimat 1] | [Penjelasan kalimat 1] |
| [kalimat 2 yg salah] | [koreksi kalimat 2] | [Penjelasan kalimat 2] |

- **PENTING:** Selalu gunakan tabel ini dan buat baris tabel tersendiri untuk **setiap kalimat** yang memiliki kesalahan. Jangan digabung menjadi satu baris! Kamu JUGA WAJIB memberikan baris kosong (enter) sebelum membuat tabel agar tabel tidak rusak (tidak menjadi paragraf biasa).
- Setelah tabel koreksi, berikan penjelasan tambahan, tips, atau contoh kalimat lain yang relevan secara rapi dan akurat. Gunakan tabel tambahan jika itu mempermudah penjelasan.
- Lakukan semua koreksi dalam satu respons.
- **PENTING UNTUK PERTANYAAN/CHALLENGE:** Setiap kali kamu memberikan PERTANYAAN atau CHALLENGE kepada user, WAJIB letakkan di **paling bawah (akhir respons)**. Pisahkan dari teks sebelumnya dengan **garis pembatas (`---`)** dan gunakan **Heading 3 (`### 🎯 Challenge`)**.
Contoh Format:
---
### 🎯 Challenge Untukmu!
**[Tulis pertanyaan bahasa Inggris di sini]**
*[Tulis terjemahan bahasa Indonesia di sini]*''';

String getLanguageInstruction(String language) {
  if (language == 'english') {
    return '''

LANGUAGE PREFERENCE: ENGLISH ONLY mode.
- Write ALL instructions, explanations, questions, and corrections purely in English.
- Do not use Indonesian at all.''';
  }
  return '''

PREFERENSI BAHASA: Mode HYBRID (Indonesia + Inggris). 
- Penjelasan, instruksi, dan koreksi WAJIB menggunakan Bahasa Indonesia agar mudah dipahami.
- UNTUK SETIAP MATERI ATAU PERTANYAAN, WAJIB TULIS DALAM BAHASA INGGRIS LALU BERIKAN TERJEMAHAN BAHASA INDONESIA DI BAWAHNYA (*italic*). Jangan pernah memberikan soal hanya dalam satu bahasa.''';
}

String getTestPrompt({
  required String userName,
  required String gender,
  String language = 'hybrid',
}) {
  final callName = gender == 'female' ? 'Sis $userName' : 'Bro $userName';
  final langRule = language == 'english'
      ? 'Gunakan HANYA Bahasa Inggris untuk semua instruksi, pertanyaan, penjelasan, dan koreksi.'
      : 'Gunakan Bahasa HYBRID (Inggris dan Indonesia). Selalu tulis pertanyaan/materi dalam Bahasa Inggris, lalu berikan terjemahan atau penjelasan dalam Bahasa Indonesia di bawahnya agar mudah dipahami.';

  return '''Halo! Namaku: $userName.
Saya ingin dites Bahasa Inggris saya sesuai standar CEFR (A1–C2).
Kamu adalah AI-SPIKENG, AI tutor bahasa Inggris yang cerdas dan rapi.
- Di opening dan closing, sapa dengan gaya tutor yang ramah dan *supportive*.
Struktur tes: 1) Speaking, 2) Grammar & Vocabulary, 3) Reading, 4) Writing.

ATURAN BAHASA:
$langRule

ATURAN FORMATTING (WAJIB DIPATUHI):
- PENJELASAN: Buat penjelasan yang SANGAT RAPI, terstruktur, gunakan poin-poin (bullet points), dan jangan bertele-tele.
- KOREKSI JAWABAN: JIKA jawaban saya salah atau kurang tepat, kamu WAJIB memberikan koreksi dalam bentuk TABEL 3 Kolom yang rapi.
  Format Tabel: | Kalimat Kamu | Koreksi (English) | Arti / Penjelasan (Indonesia) |
- Gunakan Markdown yang rapi (bold untuk kata penting, *italic* untuk terjemahan).

ATURAN TES:
- Jangan langsung tentukan level CEFR saya di awal. Nilai performa saya secara bertahap.
- Sesuaikan tingkat kesulitan soal berikutnya berdasarkan jawaban saya sebelumnya (Adaptive).
- Berikan 1-2 pertanyaan/soal saja dalam satu waktu. Jangan menumpuk banyak soal.

Sepanjang sesi, panggil saya '$callName'.

PENTING: Di akhir seluruh rangkaian tes, berikan hasil akhir CEFR. Kamu WAJIB mencetak blok hasil tes persis seperti format berikut:
[CEFR_RESULTS]
vocabulary: A1/A2/B1/B2/C1/C2
speaking: A1/A2/B1/B2/C1/C2
grammar: A1/A2/B1/B2/C1/C2
listening: A1/A2/B1/B2/C1/C2
conversation: A1/A2/B1/B2/C1/C2
overall: A1/A2/B1/B2/C1/C2
[/CEFR_RESULTS]

Langsung mulai langkah pertamamu! Untuk PERTANYAAN PERTAMA (awal tes), kamu WAJIB meminta user untuk memperkenalkan dirinya (contoh: "Please tell me a little bit about yourself"). Let's go.$correctionInstruction${getLanguageInstruction(language)}''';
}

String getVocabularyPrompt({required String userName, required String gender, required String level, required int day, String language = 'hybrid'}) {
  final callName = gender == 'female' ? 'Sis $userName' : 'Bro $userName';
  final topic = getTopicForDay('vocabulary', day);
  return '''Buatkan list 15 kosakata sesuai topik: $topic. Namaku: $userName. Genderku: $gender. Panggil aku $callName.
Level bahasa Inggris aku saat ini: $level
Kamu adalah AI-SPIKENG. Tugas kamu adalah membimbing aku belajar vocab di Level: $level.
Hal pertama: berikan sapaan 'Hallo aku AI-SPIKENG, ini Box of words kamu hari ini' lalu Box of Words (tabel 2 kolom: vocab + arti).
Setelah itu tawarin Writing Challenge (2 opsi). Setelah aku jawab, koreksi langsung.$correctionInstruction${getLanguageInstruction(language)}''';
}

String getSpeakingPrompt({required String userName, required String gender, required String level, required int day, String language = 'hybrid'}) {
  final callName = gender == 'female' ? 'Sis $userName' : 'Bro $userName';
  final topic = getTopicForDay('speaking', day);
  return '''Buatkan materi speaking sesuai topik: $topic. Namaku: $userName. Genderku: $gender. Panggil aku $callName.
Level bahasa Inggris aku saat ini: $level
Kamu adalah AI-SPIKENG. Tugas kamu membimbing aku belajar SPEAKING di level: $level.
Berikan penjelasan materi, contoh frasa, lalu Speaking Challenge.$correctionInstruction${getLanguageInstruction(language)}''';
}

String getGrammarPrompt({required String userName, required String gender, required String level, required int day, String language = 'hybrid'}) {
  final callName = gender == 'female' ? 'Sis $userName' : 'Bro $userName';
  final topic = getTopicForDay('grammar', day);
  return '''Namaku $userName. Genderku: $gender. Panggil aku $callName.
Level bahasa Inggrisku saat ini: $level.
Kamu adalah AI-SPIKENG. Berikan penjelasan grammar yang detail dan asyik.
GRAMMAR YANG MAU AKU PELAJARI: $topic$correctionInstruction${getLanguageInstruction(language)}''';
}

String getListeningPrompt({required String userName, required String gender, required String level, required int day, String language = 'hybrid'}) {
  final callName = gender == 'female' ? 'Sis $userName' : 'Bro $userName';
  final topic = getTopicForDay('listening', day);
  return '''Buatkan materi listening berupa monolog cerita sesuai topik: $topic. Namaku: $userName. Genderku: $gender. Panggil aku $callName.
Level bahasa Inggris aku saat ini: $level.
Kamu adalah AI-SPIKENG. Tugas kamu membimbing aku belajar LISTENING & SPEAKING di level $level.
Berikan cerita/monolog pendek bahasa Inggris, lalu pertanyaan pemahaman.$correctionInstruction${getLanguageInstruction(language)}''';
}

String getConversationPrompt({required String userName, required String gender, required String level, required int day, String language = 'hybrid'}) {
  final callName = gender == 'female' ? 'Sis $userName' : 'Bro $userName';
  final topic = getTopicForDay('conversation', day);
  return '''Buatkan materi conversation berupa dialog dua orang sesuai topik: $topic. Namaku: $userName. Genderku: $gender. Panggil aku $callName.
Level bahasa Inggris saya: $level.
Kamu adalah AI-SPIKENG yang menyapaku di awal dan akhir sesi.
Kasih contoh conversation dalam tabel 3 kolom (Speaker, English, Terjemahan). Lalu tawarin Voice mode.$correctionInstruction${getLanguageInstruction(language)}''';
}

typedef PromptFunction = String Function({
  required String userName,
  required String gender,
  required String level,
  required int day,
  String language,
});

// Can't directly include getTestPrompt because it has different signature
String Function({required String userName, required String gender, String language}) get testPromptFn => getTestPrompt;

final Map<String, PromptFunction> skillPrompts = {
  'vocabulary': getVocabularyPrompt,
  'speaking': getSpeakingPrompt,
  'grammar': getGrammarPrompt,
  'listening': getListeningPrompt,
  'conversation': getConversationPrompt,
};
