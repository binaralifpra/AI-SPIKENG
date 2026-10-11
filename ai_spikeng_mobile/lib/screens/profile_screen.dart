import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../config/theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isEditing = false;
  bool _saving = false;
  String _error = '';

  late TextEditingController _nameCtrl;
  late TextEditingController _ageCtrl;
  late TextEditingController _bioCtrl;
  String _gender = 'male';
  String _language = 'hybrid';

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController();
    _ageCtrl = TextEditingController();
    _bioCtrl = TextEditingController();
    _loadProfile();
  }

  void _loadProfile() {
    final userData = context.read<AuthProvider>().userData;
    if (userData?.profile != null) {
      _nameCtrl.text = userData!.profile!.name;
      _ageCtrl.text = userData.profile!.age;
      _bioCtrl.text = userData.profile!.bio;
      _gender = userData.profile!.gender;
    }
    _language = userData?.settings.language ?? 'hybrid';
    _isEditing = !(userData?.profile?.isComplete ?? false);
  }

  Future<void> _save() async {
    setState(() { _saving = true; _error = ''; });
    try {
      await context.read<AuthProvider>().updateUserData({
        'profile': {
          'name': _nameCtrl.text.trim(),
          'gender': _gender,
          'age': _ageCtrl.text.trim(),
          'bio': _bioCtrl.text.trim(),
          'email': context.read<AuthProvider>().user?.email ?? '',
          'createdAt': context.read<AuthProvider>().userData?.profile?.createdAt ?? DateTime.now().toIso8601String(),
        },
        'settings': {'language': _language},
      });
      setState(() => _isEditing = false);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _ageCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final userData = auth.userData;
    final userName = userData?.profile?.name ?? auth.user?.displayName ?? 'User';
    final initials = userName.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('').toUpperCase();

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Header card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppColors.gradientStart, AppColors.gradientEnd]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: Colors.white.withValues(alpha: 0.2),
                    child: Text(initials.isEmpty ? 'U' : initials, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(height: 10),
                  Text(userName, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                  Text(auth.user?.email ?? '', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Form / View card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_isEditing ? 'Edit Profil' : 'Data Profil', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        if (!_isEditing)
                          TextButton.icon(
                            onPressed: () => setState(() => _isEditing = true),
                            icon: const Icon(Icons.edit, size: 16),
                            label: const Text('Edit'),
                          ),
                        if (_isEditing && (userData?.profile?.isComplete ?? false))
                          TextButton.icon(
                            onPressed: () { _loadProfile(); setState(() => _isEditing = false); },
                            icon: const Icon(Icons.close, size: 16),
                            label: const Text('Batal'),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (!_isEditing) ...[
                      _InfoRow('Nama Lengkap', userData?.profile?.name ?? '—'),
                      _InfoRow('Gender', userData?.profile?.gender == 'male' ? '👨 Male' : '👩 Female'),
                      _InfoRow('Usia', '${userData?.profile?.age ?? '—'} Tahun'),
                      _InfoRow('Bio / Motivasi', userData?.profile?.bio ?? '—'),
                      _InfoRow('Preferensi AI', _language == 'hybrid' ? '🇮🇩🇬🇧 Hybrid' : '🇬🇧 English Only'),
                    ] else ...[
                      TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Nama Lengkap', prefixIcon: Icon(Icons.person_outline))),
                      const SizedBox(height: 12),
                      const Text('Gender', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _genderChip('👨 Male', _gender == 'male', () => setState(() => _gender = 'male')),
                          const SizedBox(width: 12),
                          _genderChip('👩 Female', _gender == 'female', () => setState(() => _gender = 'female')),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextField(controller: _ageCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Usia')),
                      const SizedBox(height: 12),
                      TextField(controller: _bioCtrl, maxLines: 3, decoration: const InputDecoration(labelText: 'Bio / Motivasi Belajar')),
                      const SizedBox(height: 16),
                      const Text('Bahasa Respon AI', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 8),
                      _langOption('🇮🇩🇬🇧 Hybrid (ID-EN)', 'hybrid', _language, (v) => setState(() => _language = v)),
                      const SizedBox(height: 8),
                      _langOption('🇬🇧 English Only', 'english', _language, (v) => setState(() => _language = v)),
                      const SizedBox(height: 16),
                      if (_error.isNotEmpty) ...[
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                          child: Text(_error, style: const TextStyle(color: Colors.red, fontSize: 12)),
                        ),
                        const SizedBox(height: 8),
                      ],
                      ElevatedButton.icon(
                        onPressed: (_saving || _nameCtrl.text.isEmpty || _ageCtrl.text.isEmpty) ? null : _save,
                        icon: _saving
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Icon(Icons.save),
                        label: Text(_saving ? 'Menyimpan...' : 'Simpan Perubahan'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  const _InfoRow(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 120, child: Text(label, style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5)))),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}

Widget _genderChip(String label, bool selected, VoidCallback onTap) {
  return Expanded(
    child: GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected ? AppColors.gradientStart : Colors.grey.shade600, width: selected ? 2 : 1),
          color: selected ? AppColors.gradientStart.withValues(alpha: 0.1) : null,
        ),
        child: Center(child: Text(label, style: TextStyle(fontWeight: selected ? FontWeight.w600 : FontWeight.w400))),
      ),
    ),
  );
}

Widget _langOption(String label, String value, String current, ValueChanged<String> onChanged) {
  final selected = current == value;
  return GestureDetector(
    onTap: () => onChanged(value),
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: selected ? AppColors.gradientStart : Colors.grey.shade600, width: selected ? 2 : 1),
        color: selected ? AppColors.gradientStart.withValues(alpha: 0.1) : null,
      ),
      child: Text(label, style: TextStyle(fontWeight: selected ? FontWeight.w600 : FontWeight.w400)),
    ),
  );
}
