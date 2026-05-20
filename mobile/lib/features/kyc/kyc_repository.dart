import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';

class KycRepository {
  KycRepository(this._dio);
  final Dio _dio;

  Future<void> submitPan({required String panNumber, required String nameAsPerPan}) async {
    await _dio.post('/kyc/pan', data: {
      'panNumber': panNumber.toUpperCase(),
      'nameAsPerPan': nameAsPerPan,
    });
  }

  Future<void> submitAadhaar({
    required String aadhaarLast4,
    required String addressLine1,
    required String city,
    required String pincode,
  }) async {
    await _dio.post('/kyc/aadhaar', data: {
      'aadhaarLast4': aadhaarLast4,
      'addressLine1': addressLine1,
      'city': city,
      'pincode': pincode,
    });
  }

  Future<void> submitSelfie(File file) async {
    final form = FormData.fromMap({
      'selfie': await MultipartFile.fromFile(file.path, filename: 'selfie.jpg'),
    });
    await _dio.post('/kyc/selfie', data: form);
  }

  Future<Map<String, dynamic>> getStatus() async {
    final res = await _dio.get('/kyc/status');
    return Map<String, dynamic>.from(res.data as Map);
  }
}

final kycRepositoryProvider = Provider<KycRepository>((ref) {
  return KycRepository(ref.watch(apiClientProvider));
});
