import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../config/theme.dart';
import '../utils/day_tracker.dart';
import '../widgets/training_calendar_widget.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  static const _skills = ['vocabulary', 'speaking', 'grammar', 'listening', 'conversation'];
  static const _skillIcons = {
    'vocabulary': Icons.menu_book,
    'speaking': Icons.mic,
    'grammar': Icons.edit_note,
    'listening': Icons.headphones,
    'conversation': Icons.chat_bubble_outline,
  };

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final userData = auth.userData;
    final testCompleted = userData?.testCompleted ?? false;
    final userName = userData?.profile?.name ?? 'User';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: Icon(context.watch<ThemeProvider>().isDark ? Icons.dark_mode : Icons.light_mode),
            onPressed: () => context.read<ThemeProvider>().toggleTheme(),
          ),
        ],
      ),
      drawer: _buildDrawer(context, auth),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppColors.gradientStart, AppColors.gradientEnd]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Selamat Datang, $userName! 👋',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    testCompleted ? 'Lanjutkan latihan bahasa Inggrismu!' : 'Mulai dengan tes CEFR untuk mengukur kemampuanmu.',
                    style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.8)),
                  ),
                  if (!testCompleted) ...[
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () => Navigator.pushNamed(context, '/test'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.gradientStart,
                        minimumSize: const Size(0, 40),
                      ),
                      child: const Text('Mulai Tes CEFR'),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Training', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),

            // Skill cards grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              itemCount: _skills.length,
              itemBuilder: (context, index) {
                final skill = _skills[index];
                final level = userData?.getSkillLevel(skill) ?? 'A1';
                final dayProgress = userData?.dayProgress[skill];
                final currentDay = dayProgress?.currentDay ?? 1;
                final percent = (currentDay / 30 * 100).round();
                final isLocked = !testCompleted;
                final color = AppColors.getSkillColor(skill);

                return GestureDetector(
                  onTap: isLocked ? null : () => Navigator.pushNamed(context, '/$skill'),
                  child: Card(
                    child: Opacity(
                      opacity: isLocked ? 0.5 : 1.0,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(_skillIcons[skill], color: color, size: 20),
                                ),
                                const Spacer(),
                                if (isLocked)
                                  const Icon(Icons.lock, size: 16, color: Colors.grey)
                                else
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppColors.getCefrColor(level).withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(level,
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.getCefrColor(level)),
                                    ),
                                  ),
                              ],
                            ),
                            const Spacer(),
                            Text(skillLabels[skill] ?? skill,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            Text('Day $currentDay/30',
                              style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)),
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: percent / 100,
                                backgroundColor: color.withValues(alpha: 0.1),
                                valueColor: AlwaysStoppedAnimation(color),
                                minHeight: 4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
            
            const Text('Kalender Latihan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: TrainingCalendarWidget(calendarData: userData?.calendar ?? {}),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, AuthProvider auth) {
    final userData = auth.userData;
    final userName = userData?.profile?.name ?? auth.user?.displayName ?? 'User';
    final initials = userName.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('').toUpperCase();
    final langLabel = userData?.settings.language == 'english' ? '🇬🇧 EN' : '🇮🇩🇬🇧 Hybrid';

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [AppColors.gradientStart, AppColors.gradientEnd]),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Center(child: Text('AI', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16))),
                  ),
                  const SizedBox(width: 12),
                  const Text('AI-SPIKENG', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                ],
              ),
            ),
            const Divider(height: 1),

            // Nav items
            _NavItem(icon: Icons.dashboard, label: 'Dashboard', route: '/dashboard'),
            _NavItem(icon: Icons.assignment, label: 'CEFR Test', route: '/test'),
            _NavItem(icon: Icons.person, label: 'Profile', route: '/profile'),

            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text('TRAINING', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4), letterSpacing: 1)),
            ),

            ..._skills.map((skill) {
              final level = userData?.getSkillLevel(skill) ?? 'A1';
              return _NavItem(
                icon: _skillIcons[skill]!,
                label: skillLabels[skill]!,
                route: '/$skill',
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.getCefrColor(level).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(level, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.getCefrColor(level))),
                ),
              );
            }),

            const Spacer(),
            const Divider(height: 1),

            // User info
            ListTile(
              leading: CircleAvatar(
                backgroundColor: AppColors.gradientStart,
                child: Text(initials.isEmpty ? 'U' : initials, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              ),
              title: Text(userName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: Text(langLabel, style: const TextStyle(fontSize: 11)),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/profile');
              },
            ),
            ListTile(
              leading: const Icon(Icons.logout, size: 20),
              title: const Text('Logout', style: TextStyle(fontSize: 13)),
              onTap: () async {
                Navigator.pop(context);
                await auth.logout();
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;
  final Widget? trailing;
  const _NavItem({required this.icon, required this.label, required this.route, this.trailing});

  @override
  Widget build(BuildContext context) {
    final isActive = ModalRoute.of(context)?.settings.name == route;
    return ListTile(
      dense: true,
      leading: Icon(icon, size: 20, color: isActive ? AppColors.gradientStart : null),
      title: Text(label, style: TextStyle(fontSize: 13, fontWeight: isActive ? FontWeight.w600 : FontWeight.w400, color: isActive ? AppColors.gradientStart : null)),
      trailing: trailing,
      selected: isActive,
      onTap: () {
        Navigator.pop(context);
        if (!isActive) Navigator.pushReplacementNamed(context, route);
      },
    );
  }
}
