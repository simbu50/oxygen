import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import 'auth_repository.dart';

class PhoneScreen extends ConsumerStatefulWidget {
  const PhoneScreen({super.key});
  @override
  ConsumerState<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends ConsumerState<PhoneScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phone = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    final phone = '+91${_phone.text.trim()}';
    try {
      final res = await ref.read(authRepositoryProvider).sendOtp(phone);
      if (!mounted) return;
      context.push('/auth/otp', extra: {'phone': phone, 'requestId': res.requestId});
    } catch (e) {
      setState(() => _error = 'Could not send OTP. Try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                const Text(
                  'OXYGEN',
                  style: TextStyle(
                    fontSize: 28, fontWeight: FontWeight.w900,
                    color: OxygenColors.navy, letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 40),
                Text(
                  'Welcome',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: OxygenColors.navy, fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter your phone number to get started.',
                  style: TextStyle(color: OxygenColors.slate, fontSize: 14),
                ),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  decoration: const InputDecoration(
                    labelText: 'Phone',
                    prefixText: '+91  ',
                    hintText: '98765 43210',
                  ),
                  validator: (v) {
                    if (v == null || v.length != 10) return 'Enter a 10-digit phone';
                    return null;
                  },
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
                      : const Text('Send OTP'),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    'By continuing, you agree to OXYGEN\'s Terms & Privacy Policy.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: OxygenColors.slateLight),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
