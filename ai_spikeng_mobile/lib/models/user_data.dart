class UserData {
  Map<String, String> cefrLevels;
  Map<String, DayProgress> dayProgress;
  bool testCompleted;
  Map<String, CalendarDay> calendar;
  UserProfile? profile;
  UserSettings settings;

  UserData({
    Map<String, String>? cefrLevels,
    Map<String, DayProgress>? dayProgress,
    this.testCompleted = false,
    Map<String, CalendarDay>? calendar,
    this.profile,
    UserSettings? settings,
  })  : cefrLevels = cefrLevels ?? {
          'vocabulary': 'A1', 'speaking': 'A1', 'grammar': 'A1',
          'listening': 'A1', 'conversation': 'A1', 'overall': '',
        },
        dayProgress = dayProgress ?? {
          'vocabulary': DayProgress(), 'speaking': DayProgress(),
          'grammar': DayProgress(), 'listening': DayProgress(),
          'conversation': DayProgress(),
        },
        calendar = calendar ?? {},
        settings = settings ?? UserSettings();

  factory UserData.fromMap(Map<String, dynamic> map) {
    return UserData(
      cefrLevels: (map['cefrLevels'] as Map<String, dynamic>?)
          ?.map((k, v) => MapEntry(k, v?.toString() ?? 'A1')) ?? {},
      dayProgress: (map['dayProgress'] as Map<String, dynamic>?)?.map(
        (k, v) => MapEntry(k, DayProgress.fromMap(v as Map<String, dynamic>)),
      ),
      testCompleted: map['testCompleted'] as bool? ?? false,
      calendar: (map['calendar'] as Map<String, dynamic>?)?.map(
        (k, v) => MapEntry(k, CalendarDay.fromMap(v as Map<String, dynamic>)),
      ),
      profile: map['profile'] != null
          ? UserProfile.fromMap(map['profile'] as Map<String, dynamic>)
          : null,
      settings: map['settings'] != null
          ? UserSettings.fromMap(map['settings'] as Map<String, dynamic>)
          : UserSettings(),
    );
  }

  Map<String, dynamic> toMap() => {
    'cefrLevels': cefrLevels,
    'dayProgress': dayProgress.map((k, v) => MapEntry(k, v.toMap())),
    'testCompleted': testCompleted,
    'calendar': calendar.map((k, v) => MapEntry(k, v.toMap())),
    if (profile != null) 'profile': profile!.toMap(),
    'settings': settings.toMap(),
  };

  String getSkillLevel(String skill) {
    final specific = cefrLevels[skill.toLowerCase()];
    if (specific != null && specific.isNotEmpty) return specific;
    return cefrLevels['overall'] ?? 'A1';
  }
}

class DayProgress {
  int currentDay;
  String? lastPlayedDate;

  DayProgress({this.currentDay = 1, this.lastPlayedDate});

  factory DayProgress.fromMap(Map<String, dynamic> map) => DayProgress(
    currentDay: map['currentDay'] as int? ?? 1,
    lastPlayedDate: map['lastPlayedDate'] as String?,
  );

  Map<String, dynamic> toMap() => {
    'currentDay': currentDay,
    'lastPlayedDate': lastPlayedDate,
  };
}

class CalendarDay {
  List<String> activities;

  CalendarDay({List<String>? activities}) : activities = activities ?? [];

  factory CalendarDay.fromMap(Map<String, dynamic> map) => CalendarDay(
    activities: (map['activities'] as List<dynamic>?)
        ?.map((e) => e.toString()).toList() ?? [],
  );

  Map<String, dynamic> toMap() => {'activities': activities};
}

class UserProfile {
  String name;
  String email;
  String gender;
  String age;
  String bio;
  String? createdAt;

  UserProfile({
    this.name = '',
    this.email = '',
    this.gender = 'male',
    this.age = '',
    this.bio = '',
    this.createdAt,
  });

  factory UserProfile.fromMap(Map<String, dynamic> map) => UserProfile(
    name: map['name'] as String? ?? '',
    email: map['email'] as String? ?? '',
    gender: map['gender'] as String? ?? 'male',
    age: map['age']?.toString() ?? '',
    bio: map['bio'] as String? ?? '',
    createdAt: map['createdAt'] as String?,
  );

  Map<String, dynamic> toMap() => {
    'name': name, 'email': email, 'gender': gender,
    'age': age, 'bio': bio, 'createdAt': createdAt,
  };

  bool get isComplete => name.isNotEmpty && age.isNotEmpty;
}

class UserSettings {
  String language; // 'hybrid' | 'english'

  UserSettings({this.language = 'hybrid'});

  factory UserSettings.fromMap(Map<String, dynamic> map) => UserSettings(
    language: map['language'] as String? ?? 'hybrid',
  );

  Map<String, dynamic> toMap() => {'language': language};
}
