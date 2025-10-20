# Biometric Authentication Setup

This guide explains how to set up and use biometric authentication (fingerprint/face recognition) in the Islamic Dua App.

## Features Added

- **Fingerprint Login**: Users can sign in using their fingerprint or face recognition
- **WebAuthn Support**: Uses the Web Authentication API for secure biometric authentication
- **Cross-Platform**: Works on devices that support biometric authentication
- **Secure Storage**: Biometric credentials are securely stored in the database

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the WebAuthn credentials table:

```sql
-- Run this in your Supabase SQL editor
-- File: scripts/03-webauthn-credentials.sql
```

### 2. Environment Variables

Add these variables to your `.env.local` file:

```env
# WebAuthn Configuration
NEXT_PUBLIC_WEBAUTHN_RP_ID=localhost  # Use your domain in production
NEXT_PUBLIC_WEBAUTHN_RP_NAME=Islamic Dua App
```

### 3. Browser Requirements

Biometric authentication requires:
- HTTPS (in production)
- Modern browser with WebAuthn support
- Device with biometric capabilities (fingerprint reader, face recognition, etc.)

## How to Use

### For Users

1. **First-time Setup**:
   - Log in with email/password
   - Go to Settings page
   - Click "Set up Biometric Login"
   - Follow browser prompts to register your biometric

2. **Subsequent Logins**:
   - Go to login page
   - Click "Sign in with Biometrics"
   - Use your fingerprint/face recognition when prompted

### For Developers

The biometric authentication system includes:

- `BiometricLogin` component for the login page
- `BiometricSetup` component for user settings
- WebAuthn API routes for registration and authentication
- Database utilities for credential management

## Security Notes

- Biometric data never leaves the user's device
- Only cryptographic keys are stored in the database
- Each credential is unique per device
- Users can have multiple biometric credentials registered

## Browser Support

- Chrome 67+
- Firefox 60+
- Safari 14+
- Edge 18+

## Troubleshooting

**"Biometric authentication not supported"**
- Ensure you're using HTTPS (required for WebAuthn)
- Check if your browser supports WebAuthn
- Verify your device has biometric capabilities

**"Registration failed"**
- Check browser console for detailed error messages
- Ensure user is logged in before attempting registration
- Verify database permissions are set correctly

**"Authentication failed"**
- Try re-registering the biometric credential
- Check if the credential exists in the database
- Ensure the user account is still active