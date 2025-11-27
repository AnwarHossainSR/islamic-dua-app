# Islamic Dua App - React 19

Modern React 19 migration of the Islamic Dua App using Vite, TypeScript, and Supabase.

## Features

- **React 19**: Latest React features including `use()`, `useActionState`, `useOptimistic`
- **Vite**: Fast build tool and dev server
- **TypeScript**: Full type safety
- **Tailwind CSS 4**: Latest styling with `@import "tailwindcss"`
- **Supabase**: Backend and authentication
- **React Router 6**: Client-side routing

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Run development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── Layout.tsx    # Main layout with navigation
│   └── ProtectedRoute.tsx
├── lib/
│   ├── auth/         # Auth context
│   ├── supabase/     # Supabase client
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
├── pages/
│   ├── auth/         # Login/signup
│   ├── dashboard/    # Dashboard
│   ├── challenges/   # Challenges pages
│   ├── activities/   # Activities pages
│   └── duas/         # Duas pages
└── App.tsx           # Main app with routes
```

## React 19 Features Used

### `use()` Hook
Data fetching in components:
```tsx
const data = use(fetchData())
```

### `useActionState` Hook
Form handling with automatic pending states:
```tsx
const [state, formAction, isPending] = useActionState(loginAction, null)
```

### `useOptimistic` Hook
Optimistic UI updates:
```tsx
const [optimisticData, setOptimisticData] = useOptimistic(data)
```

## Pages Implemented

- ✅ Login Page
- ✅ Dashboard
- ✅ Challenges List
- ✅ Challenge Detail
- ✅ Activities List
- ✅ Duas List

## Tech Stack

- React 19.0.0
- Vite 6
- TypeScript 5
- Tailwind CSS 4
- React Router 6
- Supabase
- Lucide React (icons)

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```
