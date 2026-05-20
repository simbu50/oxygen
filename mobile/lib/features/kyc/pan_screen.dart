import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import 'kyc_repository.dart';

class PanScreen extends ConsumerStatefulWidget {
  const PanScreen({super.key});
  @override
  ConsumerState<PanScreen> createState() => _PanScreenState();
}

class _PanScreenState extends ConsumerState<PanScreen> {
  final _formKey = GlobalKey<FormState>();
  final _pan = TextEditingController();
  final _name = TextEditingController();
  bool _loading = false;
  String? _error;

  static final _panRegex = RegExp(r'^[A-Z]{5}[0-9]{4}[A-Z]$');

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(kycRepositoryProvider).submitPan(
        panNumber: _pan.text.trim(),
        nameAsPerPan: _name.text.trim(),
      );
      if (!mounted) return;
      context.pop();
    } catch (e) {
      setState(() => _error = 'Could not verify PAN. Check details and try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PAN verification')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Enter your PAN details',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: OxygenColors.navy, fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'We use NSDL to verify in real-time. Your PAN is encrypted at rest.',
                  style: TextStyle(color: OxygenColors.slate, fontSize: 13),
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _pan,
                  textCapitalization: TextCapitalization.characters,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9]')),
                    LengthLimitingTextInputFormatter(10),
                  ],
                  decoration: const InputDecoration(labelText: 'PAN number', hintText: 'ABCDE1234F'),
                  validator: (v) {
                    final value = (v ?? '').toUpperCase();
                    if (!_panRegex.hasMatch(value)) return 'Invalid PAN format';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _name,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(labelText: 'Name as per PAN'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
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
                      : const Text('Verify PAN'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
