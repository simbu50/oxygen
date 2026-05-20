# API Contracts (Sprint 1 + 2)

Base URL: `http://localhost:3000`
All POST/PUT requests are `application/json`.
All authenticated routes require `Authorization: Bearer <accessToken>`.

## Auth (mobile users)

### POST `/auth/otp/send`
Send OTP to a phone number.
```json
{ "phone": "+919876543210" }
```
Response:
```json
{ "requestId": "550e8400-e29b-41d4-a716-446655440000", "expiresInSeconds": 300 }
```

### POST `/auth/otp/verify`
Verify OTP and get tokens.
```json
{ "requestId": "...", "phone": "+919876543210", "otp": "123456" }
```
Response:
```json
{
  "accessToken": "ey...",
  "refreshToken": "ey...",
  "user": { "id": "...", "phone": "+919876543210", "isProfileComplete": false, "kycStatus": "PENDING" }
}
```

### POST `/auth/refresh`
```json
{ "refreshToken": "ey..." }
```

### POST `/auth/logout`  (auth required)

## Auth (admins)

### POST `/auth/admin/login`
```json
{ "email": "admin@oxygen.local", "password": "Admin@123" }
```

## Users

### GET `/users/me`  (auth required)
Returns current user profile + KYC status.

### PATCH `/users/me`  (auth required)
```json
{ "firstName": "Simbu", "lastName": "R", "email": "x@y.com", "dateOfBirth": "1990-01-15" }
```

## KYC

### POST `/kyc/pan`  (auth required)
```json
{ "panNumber": "ABCDE1234F", "nameAsPerPan": "SIMBU R" }
```

### POST `/kyc/aadhaar`  (auth required)
```json
{ "aadhaarLast4": "1234", "addressLine1": "...", "city": "...", "pincode": "560001" }
```

### POST `/kyc/selfie`  (auth required, multipart)
Form field: `selfie` (file, jpg/png, < 2MB).

### GET `/kyc/status`  (auth required)
```json
{ "pan": "VERIFIED", "aadhaar": "PENDING", "selfie": "PENDING", "overall": "PARTIAL" }
```

## Admin

### GET `/admin/users?status=PENDING&page=1&pageSize=20`
### GET `/admin/users/:id`
### POST `/admin/kyc/:userId/approve`  body: `{ "remarks": "..." }`
### POST `/admin/kyc/:userId/reject`  body: `{ "reason": "...", "remarks": "..." }`

## Errors

```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": "panNumber must match /^[A-Z]{5}[0-9]{4}[A-Z]$/",
  "traceId": "..."
}
```
