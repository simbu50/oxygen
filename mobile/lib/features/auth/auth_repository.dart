import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_client.dart';
import '../../core/auth_store.dart';

class AuthRepository {
  AuthRepository(this._dio, this._authStore);
  final Dio _dio;
  final AuthStore _authStore;

  Future<({String requestId, int expiresInSeconds})> sendOtp(String phone) async {
    final res = await _dio.post('/auth/otp/send', data: {'phone': phone});
    return (
      requestId: res.data['requestId'] as String,
      expiresInSeconds: res.data['expiresInSeconds'] as int,
    );
  }

  Future<AuthSession> verifyOtp({
    required String requestId,
    required String phone,
    required String otp,
  }) async {
    final res = await _dio.post('/auth/otp/verify', data: {
      'requestId': requestId,
      'phone': phone,
      'otp': otp,
    });
    final user = res.data['user'] as Map<String, dynamic>;
    final session = AuthSession(
      accessToken: res.data['accessToken'] as String,
      refreshToken: res.data['refreshToken'] as String,
      userId: user['id'] as String,
      phone: user['phone'] as String,
      isProfileComplete: user['isProfileComplete'] as bool,
      kycStatus: user['kycStatus'] as String,
    );
    await _authStore.save(session);
    return session;
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } finally {
      await _authStore.clear();
    }
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(apiClientProvider);
  final store = ref.watch(authStoreProvider.notifier);
  return AuthRepository(dio, store);
});
