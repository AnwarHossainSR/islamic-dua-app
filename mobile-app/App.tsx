import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from '@/navigation';
import { AppProviders } from '@/providers';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar style="auto" />
        <Navigation />
      </AppProviders>
    </SafeAreaProvider>
  );
}
