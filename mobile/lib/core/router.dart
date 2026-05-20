import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/phone_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/auth/splash_screen.dart';
import '../features/profile/profile_setup_screen.dart';
import '../features/kyc/kyc_intro_screen.dart';
import '../features/kyc/pan_screen.dart';
import '../features/kyc/aadhaar_screen.dart';
import '../features/kyc/selfie_screen.dart';
import '../features/kyc/kyc_done_screen.dart';
import '../features/home/home_screen.dart';
import 'auth_store.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: _GoRouterRefreshNotifier(ref),
    redirect: (context, state) {
      final session = ref.read(authStoreProvider);
      final loc = state.matchedLocation;

      if (loc == '/splash') return null;

      // Not signed in -> phone/otp only
      if (session == null) {
        if (loc.startsWith('/auth')) return null;
        return '/auth/phone';
      }

      // Signed in but profile incomplete -> profile setup
      if (!session.isProfileComplete && loc != '/profile') return '/profile';

      // Signed in + profile done but KYC incomplete -> KYC flow
      if (session.isProfileComplete &&
          session.kycStatus != 'VERIFIED' &&
          session.kycStatus != 'SUBMITTED' &&
          !loc.startsWith('/kyc')) {
        return '/kyc';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/auth/phone', builder: (_, __) => const PhoneScreen()),
      GoRoute(
        path: '/auth/otp',
        builder: (_, state) {
          final args = state.extra as Map<String, dynamic>;
          return OtpScreen(phone: args['phone'] as String, requestId: args['requestId'] as String);
        },
      ),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileSetupScreen()),
      GoRoute(path: '/kyc', builder: (_, __) => const KycIntroScreen()),
      GoRoute(path: '/kyc/pan', builder: (_, __) => const PanScreen()),
      GoRoute(path: '/kyc/aadhaar', builder: (_, __) => const AadhaarScreen()),
      GoRoute(path: '/kyc/selfie', builder: (_, __) => const SelfieScreen()),
      GoRoute(path: '/kyc/done', builder: (_, __) => const KycDoneScreen()),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    ],
  );
});

class _GoRouterRefreshNotifier extends ChangeNotifier {
  _GoRouterRefreshNotifier(Ref ref) {
    ref.listen(authStoreProvider, (_, __) => notifyListeners());
  }
}
