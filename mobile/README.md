# OXYGEN Mobile

Flutter (Android + iOS). Connects to `oxygen-backend`.

## Run

```bash
flutter pub get
# Android emulator (10.0.2.2 = host machine where backend runs)
flutter run --dart-define=MOBILE_API_BASE_URL=http://10.0.2.2:3000
# iOS simulator
flutter run --dart-define=MOBILE_API_BASE_URL=http://localhost:3000
# Real device on same Wi-Fi
flutter run --dart-define=MOBILE_API_BASE_URL=http://192.168.1.42:3000
```

## Flow

```
Splash
  → /auth/phone   (enter +91 phone)
  → /auth/otp     (enter 6-digit OTP, dev: 123456)
  → /profile      (name, email, DOB)
  → /kyc          (PAN + Aadhaar + Selfie checklist)
        → /kyc/pan
        → /kyc/aadhaar
        → /kyc/selfie
  → /kyc/done
  → /home         (loan products placeholder)
```

Router redirects enforce this order — a user can't skip ahead.

## Structure

```
lib/
├── main.dart                     ProviderScope root
├── app.dart                      MaterialApp.router
├── core/
│   ├── theme.dart                OXYGEN brand colors + Material3 theme
│   ├── router.dart               go_router config + redirect rules
│   ├── api_client.dart           Dio + auth interceptor
│   └── auth_store.dart           Riverpod StateNotifier + flutter_secure_storage
└── features/
    ├── auth/                     phone, otp, splash, auth_repository
    ├── profile/                  profile_setup_screen
    ├── kyc/                      kyc_intro + pan + aadhaar + selfie + done + kyc_repository
    └── home/                     home_screen (loan product list placeholder)
```

## Notes

- Tokens are stored in `flutter_secure_storage` (Keystore on Android, Keychain on iOS).
- The OTP screen autocompletes nothing — production should integrate SMS user-consent autofill.
- Selfie uses `image_picker` with front camera; Sprint 3 should add a liveness SDK (Hyperverge / IDfy).
- KYC vendor is mocked server-side, so submissions always come back "verified" unless you use a special value:
  - PAN beginning with `FAIL` -> rejected
  - Aadhaar last4 `0000` -> rejected
