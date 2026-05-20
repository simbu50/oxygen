import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthSession {
  final String accessToken;
  final String refreshToken;
  final String userId;
  final String phone;
  final bool isProfileComplete;
  final String kycStatus;

  AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.userId,
    required this.phone,
    required this.isProfileComplete,
    required this.kycStatus,
  });
}

class AuthStore extends StateNotifier<AuthSession?> {
  AuthStore() : super(null) {
    _hydrate();
  }

  static final _storage = FlutterSecureStorage();
  static const _kAccess = 'oxygen.access';
  static const _kRefresh = 'oxygen.refresh';
  static const _kUserId = 'oxygen.userId';
  static const _kPhone = 'oxygen.phone';
  static const _kProfile = 'oxygen.profileComplete';
  static const _kKyc = 'oxygen.kycStatus';

  Future<void> _hydrate() async {
    final access = await _storage.read(key: _kAccess);
    final refresh = await _storage.read(key: _kRefresh);
    final userId = await _storage.read(key: _kUserId);
    final phone = await _storage.read(key: _kPhone);
    if (access != null && refresh != null && userId != null && phone != null) {
      state = AuthSession(
        accessToken: access,
        refreshToken: refresh,
        userId: userId,
        phone: phone,
        isProfileComplete: (await _storage.read(key: _kProfile)) == 'true',
        kycStatus: (await _storage.read(key: _kKyc)) ?? 'PENDING',
      );
    }
  }

  Future<void> save(AuthSession s) async {
    state = s;
    await _storage.write(key: _kAccess, value: s.accessToken);
    await _storage.write(key: _kRefresh, value: s.refreshToken);
    await _storage.write(key: _kUserId, value: s.userId);
    await _storage.write(key: _kPhone, value: s.phone);
    await _storage.write(key: _kProfile, value: s.isProfileComplete.toString());
    await _storage.write(key: _kKyc, value: s.kycStatus);
  }

  Future<void> updateProfileStatus({bool? isProfileComplete, String? kycStatus}) async {
    if (state == null) return;
    final next = AuthSession(
      accessToken: state!.accessToken,
      refreshToken: state!.refreshToken,
      userId: state!.userId,
      phone: state!.phone,
      isProfileComplete: isProfileComplete ?? state!.isProfileComplete,
      kycStatus: kycStatus ?? state!.kycStatus,
    );
    await save(next);
  }

  Future<String?> getAccessToken() async => state?.accessToken;

  Future<void> clear() async {
    state = null;
    await _storage.deleteAll();
  }
}

final authStoreProvider = StateNotifierProvider<AuthStore, AuthSession?>((ref) => AuthStore());
