import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toast />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Only export provider components from this file
export { AuthProvider } from './AuthProvider';
export { ThemeProvider } from './ThemeProvider';
