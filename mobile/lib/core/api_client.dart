import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_store.dart';

const _defaultBaseUrl = String.fromEnvironment(
  'MOBILE_API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3000', // Android emulator -> host
);

final apiClientProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: '$_defaultBaseUrl/api',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await ref.read(authStoreProvider.notifier).getAccessToken();
      if (token != null) {
        options.headers['authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
    onError: (e, handler) async {
      if (e.response?.statusCode == 401) {
        await ref.read(authStoreProvider.notifier).clear();
      }
      handler.next(e);
    },
  ));

  return dio;
});
