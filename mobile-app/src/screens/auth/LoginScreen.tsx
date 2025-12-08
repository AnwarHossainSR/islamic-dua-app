import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { authApi } from '@/api/auth.api';
import { Button, Input } from '@/components/ui';
import { APP_NAME, ROUTES } from '@/config/routes';
import { useTheme } from '@/hooks/useTheme';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.signIn(email, password);
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have successfully logged in.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Invalid email or password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>🕌</Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>{APP_NAME}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Track your spiritual journey
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              containerStyle={styles.passwordInput}
            />

            <Button onPress={handleLogin} loading={loading} style={styles.loginButton}>
              Sign In
            </Button>

            <View style={styles.signupRow}>
              <Text style={[styles.signupText, { color: colors.mutedForeground }]}>
                Don't have an account?
              </Text>
              <Pressable
                onPress={() => navigation.navigate(ROUTES.SIGNUP)}
                style={styles.signupLink}
              >
                <Text style={[styles.signupLinkText, { color: colors.primary }]}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  passwordInput: {
    marginTop: 8,
  },
  loginButton: {
    marginTop: 16,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  signupLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
