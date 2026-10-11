# AI-SPIKENG Web

Versi website dari aplikasi mobile `ai_spikeng_mobile` (Flutter). Struktur halaman, prompt AI,
kurikulum 30 hari, dan data Firestore **identik** dengan aplikasi mobile — akun & progres yang sama
bisa dipakai di HP dan di web.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # hasil di dist/
```

`.env` berisi `VITE_GROQ_API_KEY` dan `VITE_FIREBASE_*` (sama dengan `.env` aplikasi mobile).

## Pemetaan Flutter → Web

| Mobile (lib/)                         | Web (src/)                          |
|---------------------------------------|-------------------------------------|
| main.dart (routes)                    | App.jsx                             |
| config/groq_api.dart                  | config/groqApi.js                   |
| config/prompts.dart                   | config/prompts.js                   |
| config/theme.dart                     | config/theme.js + index.css         |
| models/user_data.dart                 | models/userData.js                  |
| providers/auth_provider.dart          | providers/AuthProvider.jsx          |
| providers/theme_provider.dart         | providers/ThemeProvider.jsx         |
| screens/login_screen.dart             | screens/LoginScreen.jsx             |
| screens/dashboard_screen.dart         | screens/DashboardScreen.jsx         |
| screens/profile_screen.dart           | screens/ProfileScreen.jsx           |
| screens/test_screen.dart              | screens/TestScreen.jsx              |
| screens/training_screen.dart          | screens/TrainingScreen.jsx          |
| widgets/chat_message_widget.dart      | widgets/ChatMessageWidget.jsx       |
| widgets/chat_input_widget.dart        | widgets/ChatInputWidget.jsx         |
| widgets/training_calendar_widget.dart | widgets/TrainingCalendarWidget.jsx  |
| utils/cefr_levels.dart                | utils/cefrLevels.js                 |
| utils/day_tracker.dart                | utils/dayTracker.js                 |

Rute: `/login`, `/dashboard`, `/profile`, `/test`, `/vocabulary`, `/speaking`, `/grammar`,
`/listening`, `/conversation`.

## Catatan deploy

- Tambahkan domain hosting ke **Firebase Console → Authentication → Settings → Authorized domains**
  agar login Google berfungsi (localhost sudah diizinkan secara default).
- Hosting SPA: arahkan semua path ke `index.html` (mis. Firebase Hosting `rewrites`, Vercel/Netlify SPA fallback).
- Input suara memakai Web Speech API (Chrome/Edge). Di browser yang tidak mendukung, tombol mic disembunyikan.
