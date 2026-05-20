import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import 'kyc_repository.dart';

class AadhaarScreen extends ConsumerStatefulWidget {
  const AadhaarScreen({super.key});
  @override
  ConsumerState<AadhaarScreen> createState() => _AadhaarScreenState();
}

class _AadhaarScreenState extends ConsumerState<AadhaarScreen> {
  final _formKey = GlobalKey<FormState>();
  final _last4 = TextEditingController();
  final _addr = TextEditingController();
  final _city = TextEditingController();
  final _pincode = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(kycRepositoryProvider).submitAadhaar(
        aadhaarLast4: _last4.text.trim(),
        addressLine1: _addr.text.trim(),
        city: _city.text.trim(),
        pincode: _pincode.text.trim(),
      );
      if (!mounted) return;
      context.pop();
    } catch (e) {
      setState(() => _error = 'Could not verify Aadhaar. Try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Aadhaar verification')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Aadhaar details',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: OxygenColors.navy, fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'We never store your full Aadhaar number. Verification via UIDAI.',
                  style: TextStyle(color: OxygenColors.slate, fontSize: 13),
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _last4,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(4),
                  ],
                  decoration: const InputDecoration(labelText: 'Last 4 digits of Aadhaar'),
                  validator: (v) => (v == null || v.length != 4) ? 'Enter 4 digits' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _addr,
                  decoration: const InputDecoration(labelText: 'Address line 1'),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _city,
                  decoration: const InputDecoration(labelText: 'City'),
                  textCapitalization: TextCapitalization.words,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _pincode,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(6),
                  ],
                  decoration: const InputDecoration(labelText: 'Pincode'),
                  validator: (v) => (v == null || v.length != 6) ? 'Enter 6 digits' : null,
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
                      : const Text('Verify Aadhaar'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
