import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/theme.dart';

class ProfileSetupScreen extends ConsumerStatefulWidget {
  const ProfileSetupScreen({super.key});
  @override
  ConsumerState<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends ConsumerState<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _email = TextEditingController();
  DateTime? _dob;
  bool _loading = false;
  String? _error;

  Future<void> _pickDob() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 25, now.month, now.day),
      firstDate: DateTime(now.year - 80),
      lastDate: DateTime(now.year - 18),
    );
    if (picked != null) setState(() => _dob = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _dob == null) {
      setState(() => _error = _dob == null ? 'Pick your date of birth' : null);
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final dio = ref.read(apiClientProvider);
      await dio.patch('/users/me', data: {
        'firstName': _first.text.trim(),
        'lastName': _last.text.trim(),
        'email': _email.text.trim(),
        'dateOfBirth': _dob!.toIso8601String(),
      });
      await ref.read(authStoreProvider.notifier)
          .updateProfileStatus(isProfileComplete: true);
      if (!mounted) return;
      context.go('/kyc');
    } catch (e) {
      setState(() => _error = 'Could not save profile. Try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Your details')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Step 1 of 3',
                  style: TextStyle(
                    color: OxygenColors.teal, fontWeight: FontWeight.w600, letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Tell us about yourself',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: OxygenColors.navy, fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _first,
                  decoration: const InputDecoration(labelText: 'First name'),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _last,
                  decoration: const InputDecoration(labelText: 'Last name'),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email'),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Required';
                    if (!v.contains('@')) return 'Invalid email';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: _pickDob,
                  child: InputDecorator(
                    decoration: const InputDecoration(labelText: 'Date of birth'),
                    child: Text(
                      _dob != null ? DateFormat.yMMMd().format(_dob!) : 'Pick a date',
                      style: TextStyle(
                        color: _dob != null ? OxygenColors.navy : OxygenColors.slateLight,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                ],
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          width: 22, height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Continue to KYC'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
