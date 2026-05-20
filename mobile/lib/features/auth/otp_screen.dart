import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import 'auth_repository.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key, required this.phone, required this.requestId});
  final String phone;
  final String requestId;

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otp = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    if (_otp.text.length != 6) {
      setState(() => _error = 'Enter the 6-digit OTP');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final session = await ref.read(authRepositoryProvider).verifyOtp(
            requestId: widget.requestId,
            phone: widget.phone,
            otp: _otp.text,
          );
      if (!mounted) return;
      if (!session.isProfileComplete) {
        context.go('/profile');
      } else if (session.kycStatus != 'VERIFIED' && session.kycStatus != 'SUBMITTED') {
        context.go('/kyc');
      } else {
        context.go('/home');
      }
    } catch (e) {
      setState(() => _error = 'Incorrect OTP. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Enter OTP',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: OxygenColors.navy, fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We sent a 6-digit code to ${widget.phone}',
                style: TextStyle(color: OxygenColors.slate, fontSize: 14),
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _otp,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 28, letterSpacing: 16, fontWeight: FontWeight.w600),
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(6),
                ],
                decoration: const InputDecoration(hintText: '······'),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
              ],
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        width: 22, height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Verify'),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'In dev mode, OTP is 123456',
                  style: TextStyle(fontSize: 11, color: OxygenColors.slateLight),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
