# Project Structure

## Production-Grade Architecture

```
src/
├── api/                    # API layer - all backend calls
│   ├── auth.api.ts
│   ├── challenges.api.ts
│   ├── activities.api.ts
│   ├── duas.api.ts
│   └── index.ts
│
├── components/             # Shared components
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── StatCard.tsx
│   │   └── index.ts
│   ├── Layout.tsx
│   └── ProtectedRoute.tsx
│
├── config/                 # App configuration
│   ├── env.ts             # Environment variables
│   └── routes.ts          # Route definitions
│
├── constants/              # App constants
│   └── index.ts
│
├── features/               # Feature-based modules
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── challenges/
│   │   ├── ChallengeCard.tsx
│   │   └── StartChallengeButton.tsx
│   ├── duas/
│   │   └── DuaCard.tsx
│   ├── activities/
│   └── dashboard/
│
├── hooks/                  # Custom React hooks
│   └── useAuth.ts
│
├── lib/                    # Core utilities
│   ├── supabase/
│   │   └── client.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── cn.ts
│
├── pages/                  # Page components
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── challenges/
│   │   ├── ChallengesPage.tsx
│   │   └── ChallengeDetailPage.tsx
│   ├── activities/
│   │   └── ActivitiesPage.tsx
│   ├── duas/
│   │   └── DuasPage.tsx
│   └── dashboard/
│       └── DashboardPage.tsx
│
├── providers/              # Context providers
│   ├── AuthProvider.tsx
│   └── index.tsx
│
├── App.tsx                 # Main app component
├── main.tsx               # Entry point
└── vite-env.d.ts          # TypeScript declarations
```

## Architecture Principles

### 1. Separation of Concerns
- **API Layer**: All backend calls isolated in `api/`
- **Features**: Domain-specific components in `features/`
- **UI Components**: Reusable components in `components/ui/`
- **Pages**: Route-level components in `pages/`

### 2. Reusability
- UI components are generic and reusable
- Feature components are domain-specific but composable
- API functions are pure and testable

### 3. Scalability
- Feature-based structure allows easy addition of new features
- Centralized configuration in `config/`
- Constants prevent magic strings

### 4. Maintainability
- Clear folder structure
- Single responsibility principle
- Barrel exports for clean imports

## Key Patterns

### API Layer Pattern
```typescript
// api/challenges.api.ts
export const challengesApi = {
  getAll: async (userId: string) => { /* ... */ },
  getById: async (id: string) => { /* ... */ },
  start: async (challengeId: string) => { /* ... */ },
}
```

### Feature Component Pattern
```typescript
// features/challenges/ChallengeCard.tsx
export function ChallengeCard({ challenge }: Props) {
  // Component logic
}
```

### Page Pattern
```typescript
// pages/challenges/ChallengesPage.tsx
export default function ChallengesPage() {
  const data = use(challengesApi.getAll(userId))
  return <ChallengeCard challenge={data} />
}
```

### Configuration Pattern
```typescript
// config/routes.ts
export const ROUTES = {
  DASHBOARD: '/dashboard',
  CHALLENGE_DETAIL: (id: string) => `/challenges/${id}`,
}
```

## Benefits

1. **Easy Testing**: API layer is isolated and testable
2. **Easy Refactoring**: Changes are localized to specific modules
3. **Easy Onboarding**: Clear structure for new developers
4. **Easy Scaling**: Add new features without touching existing code
5. **Type Safety**: Full TypeScript support throughout
6. **Code Reuse**: Components and utilities are highly reusable
