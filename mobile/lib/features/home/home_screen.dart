import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth_store.dart';
import '../../core/theme.dart';
import '../auth/auth_repository.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  Widget _productCard({required String title, required String tagline, required IconData icon, required bool comingSoon}) {
    return Container(
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
            backgroundColor: OxygenColors.teal.withOpacity(0.12),
            child: Icon(icon, color: OxygenColors.teal),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, color: OxygenColors.navy)),
                const SizedBox(height: 4),
                Text(tagline, style: TextStyle(fontSize: 12, color: OxygenColors.slate)),
              ],
            ),
          ),
          if (comingSoon)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: OxygenColors.gold.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'COMING',
                style: TextStyle(
                  fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1, color: OxygenColors.gold,
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authStoreProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('OXYGEN'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authRepositoryProvider).logout();
              if (!context.mounted) return;
              context.go('/auth/phone');
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: OxygenColors.navy,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'KYC Status',
                      style: TextStyle(color: OxygenColors.gold, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      session?.kycStatus ?? 'PENDING',
                      style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'You\'ll be able to apply for loans once your KYC is verified.',
                      style: TextStyle(color: Color(0xFFBFD7E0), fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Loan products',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: OxygenColors.navy),
              ),
              const SizedBox(height: 8),
              _productCard(
                title: 'Personal Loan',
                tagline: '₹5K to ₹5L • 3-36 months',
                icon: Icons.account_balance_wallet_outlined,
                comingSoon: true,
              ),
              _productCard(
                title: 'Packaged Medical Loan',
                tagline: 'Direct to hospital, no upfront cash',
                icon: Icons.local_hospital_outlined,
                comingSoon: true,
              ),
              _productCard(
                title: 'Emergency Packaged Loan',
                tagline: 'Cash for urgent needs',
                icon: Icons.bolt_outlined,
                comingSoon: true,
              ),
              _productCard(
                title: 'CUT-I — Loan Takeover',
                tagline: 'Refinance high-interest loans, save EMI',
                icon: Icons.swap_horiz,
                comingSoon: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
