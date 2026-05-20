import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth_store.dart';
import '../../core/theme.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await Future<void>.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;
      final session = ref.read(authStoreProvider);
      if (session == null) {
        context.go('/auth/phone');
      } else if (!session.isProfileComplete) {
        context.go('/profile');
      } else if (session.kycStatus == 'VERIFIED' || session.kycStatus == 'SUBMITTED') {
        context.go('/home');
      } else {
        context.go('/kyc');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OxygenColors.navyDeep,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'OXYGEN',
              style: TextStyle(
                fontSize: 42,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 8,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'FINTECH',
              style: TextStyle(
                fontSize: 12,
                color: OxygenColors.gold,
                letterSpacing: 6,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 48),
            const SizedBox(
              width: 28, height: 28,
              child: CircularProgressIndicator(strokeWidth: 2, color: OxygenColors.gold),
            ),
          ],
        ),
      ),
    );
  }
}
