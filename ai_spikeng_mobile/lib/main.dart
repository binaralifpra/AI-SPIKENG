import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'config/theme.dart';

import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/test_screen.dart';
import 'screens/training_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await dotenv.load(fileName: ".env");
  
  // Initialize Firebase (automatically uses google-services.json on Android)
  try {
    await Firebase.initializeApp();
  } catch (e) {
    if (!e.toString().contains('duplicate-app')) {
      print('Firebase Init Error: $e');
    }
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const AiSpikengApp(),
    ),
  );
}

class AiSpikengApp extends StatelessWidget {
  const AiSpikengApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final authProvider = context.watch<AuthProvider>();

    if (authProvider.loading) {
      return MaterialApp(
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: themeProvider.themeMode,
        home: Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.gradientStart, AppColors.gradientEnd]),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Center(child: Text('AI', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800))),
                ),
                const SizedBox(height: 24),
                const CircularProgressIndicator(),
                const SizedBox(height: 16),
                const Text('Loading AI-SPIKENG...'),
              ],
            ),
          ),
        ),
      );
    }

    return MaterialApp(
      title: 'AI-SPIKENG',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      home: authProvider.isLoggedIn ? const DashboardScreen() : const LoginScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/test': (context) => const TestScreen(),
        '/vocabulary': (context) => const TrainingScreen(skill: 'vocabulary'),
        '/speaking': (context) => const TrainingScreen(skill: 'speaking'),
        '/grammar': (context) => const TrainingScreen(skill: 'grammar'),
        '/listening': (context) => const TrainingScreen(skill: 'listening'),
        '/conversation': (context) => const TrainingScreen(skill: 'conversation'),
      },
    );
  }
}
