# Islamic Dua - React Native Mobile App

A React Native mobile app built with Expo, featuring the same functionality as the web application.

## Features

- 🔐 Authentication (Login/Signup with Supabase)
- 📊 Dashboard with statistics
- 🎯 Challenge tracking with daily completion
- 📿 Activities monitoring
- 📖 Duas collection with Arabic text
- ⚙️ Settings & account management
- 🌙 Dark mode support (follows system)

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: React Navigation (Stack + Tabs)
- **State Management**: React Query
- **Backend**: Supabase
- **Styling**: NativeWind (Tailwind for RN)
- **Icons**: Lucide React Native

## Setup

1. **Install dependencies**:

   ```bash
   cd mobile-app
   npm install
   ```

2. **Create `.env` file** (copy from web app):

   ```bash
   cp ../.env .env
   ```

   Update the variable names:

   - `VITE_SUPABASE_URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

3. **Start the development server**:

   ```bash
   npm start
   ```

4. **Run on device**:
   - Scan QR code with **Expo Go** app (iOS/Android)
   - Or press `a` for Android emulator / `i` for iOS simulator

## Project Structure

```
mobile-app/
├── App.tsx                 # Entry point
├── src/
│   ├── api/               # API layer (Supabase calls)
│   ├── components/ui/     # Reusable UI components
│   ├── config/            # Environment & routes
│   ├── lib/               # Supabase client, theme, utils
│   ├── navigation/        # React Navigation setup
│   ├── providers/         # Auth, Theme, Query providers
│   ├── screens/           # All screen components
│   └── types/             # TypeScript definitions
└── ...config files
```

## Screens

| Screen       | Description                          |
| ------------ | ------------------------------------ |
| Login/Signup | Authentication                       |
| Dashboard    | Stats, top activities, quick actions |
| Challenges   | List, start, track progress          |
| Activities   | User activities with streaks         |
| Duas         | Search, filter, view details         |
| Settings     | Account, appearance, about           |

## Building for Production

```bash
# Build for Android
npx eas build --platform android

# Build for iOS
npx eas build --platform ios
```

## Notes

- Uses same Supabase database as web app
- Colors match web app theme (green primary)
- Supports both light and dark mode
