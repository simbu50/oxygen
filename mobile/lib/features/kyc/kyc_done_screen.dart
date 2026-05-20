import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth_store.dart';
import '../../core/theme.dart';

class KycDoneScreen extends ConsumerWidget {
  const KycDoneScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: OxygenColors.navy,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.verified_rounded, color: OxygenColors.gold, size: 88),
              const SizedBox(height: 24),
              const Center(
                child: Text(
                  'KYC submitted',
                  style: TextStyle(
                    color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  'We\'ll let you know in a few minutes once verified.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Color(0xFFBFD7E0), fontSize: 14),
                ),
              ),
              const Spacer(),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: OxygenColors.gold,
                  foregroundColor: OxygenColors.navy,
                ),
                onPressed: () async {
                  await ref.read(authStoreProvider.notifier)
                      .updateProfileStatus(kycStatus: 'SUBMITTED');
                  if (!context.mounted) return;
                  context.go('/home');
                },
                child: const Text('Explore loan products'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
