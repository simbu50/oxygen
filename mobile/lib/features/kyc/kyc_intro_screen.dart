import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import 'kyc_repository.dart';

class KycIntroScreen extends ConsumerStatefulWidget {
  const KycIntroScreen({super.key});
  @override
  ConsumerState<KycIntroScreen> createState() => _KycIntroScreenState();
}

class _KycIntroScreenState extends ConsumerState<KycIntroScreen> {
  Map<String, dynamic>? _status;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final s = await ref.read(kycRepositoryProvider).getStatus();
      if (!mounted) return;
      setState(() { _status = s; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _step({
    required int n,
    required String title,
    required String desc,
    required String status,
    required VoidCallback onTap,
  }) {
    final verified = status == 'VERIFIED';
    final rejected = status == 'REJECTED';
    return InkWell(
      onTap: verified ? null : onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: verified
                  ? OxygenColors.teal
                  : rejected
                      ? Colors.red
                      : OxygenColors.gold,
              child: Icon(
                verified ? Icons.check : rejected ? Icons.close : Icons.arrow_forward,
                color: Colors.white,
                size: 18,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Step $n  •  $title',
                    style: const TextStyle(fontWeight: FontWeight.w600, color: OxygenColors.navy),
                  ),
                  const SizedBox(height: 4),
                  Text(desc, style: TextStyle(color: OxygenColors.slate, fontSize: 13)),
                ],
              ),
            ),
            Text(
              status,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: verified
                    ? OxygenColors.teal
                    : rejected
                        ? Colors.red
                        : OxygenColors.slateLight,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pan = _status?['PAN'] ?? 'PENDING';
    final aadhaar = _status?['AADHAAR'] ?? 'PENDING';
    final selfie = _status?['SELFIE'] ?? 'PENDING';
    final overall = _status?['overall'] ?? 'PENDING';
    final allDone = pan == 'VERIFIED' && aadhaar == 'VERIFIED' && selfie == 'VERIFIED';
    return Scaffold(
      appBar: AppBar(title: const Text('Verify your identity')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'KYC takes about 2 minutes.',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(color: OxygenColors.slate),
                    ),
                    const SizedBox(height: 16),
                    _step(
                      n: 1, title: 'PAN card', desc: 'Quick verification with NSDL.',
                      status: pan, onTap: () => context.push('/kyc/pan').then((_) => _load()),
                    ),
                    _step(
                      n: 2, title: 'Aadhaar', desc: 'Last 4 digits + address.',
                      status: aadhaar, onTap: () => context.push('/kyc/aadhaar').then((_) => _load()),
                    ),
                    _step(
                      n: 3, title: 'Selfie', desc: 'Liveness check to prevent fraud.',
                      status: selfie, onTap: () => context.push('/kyc/selfie').then((_) => _load()),
                    ),
                    const Spacer(),
                    if (allDone)
                      ElevatedButton(
                        onPressed: () => context.go('/kyc/done'),
                        child: const Text('Continue'),
                      )
                    else
                      Center(
                        child: Text(
                          'Status: $overall',
                          style: TextStyle(color: OxygenColors.slateLight, fontSize: 12),
                        ),
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}
