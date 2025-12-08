import { Bell, Check, LogOut, Moon, Smartphone, Sun, User } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode } = useTheme();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            Toast.show({
              type: 'success',
              text1: 'Logged Out',
              text2: 'You have been logged out successfully.',
            });
          } catch {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to logout',
            });
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Account Section */}
        <Card>
          <CardHeader>
            <View style={styles.headerRow}>
              <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                <User color={colors.primaryForeground} size={24} />
              </View>
              <View style={styles.headerInfo}>
                <CardTitle>Account</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </View>
            </View>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onPress={handleLogout} style={styles.logoutButton}>
              <LogOut color={colors.destructiveForeground} size={18} />
              <Text
                style={{
                  color: colors.destructiveForeground,
                  fontWeight: '500',
                }}
              >
                Logout
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.themeOptions}>
              <Pressable
                onPress={() => setThemeMode('light')}
                style={[
                  styles.themeOption,
                  {
                    borderColor: themeMode === 'light' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Sun color={themeMode === 'light' ? colors.primary : colors.foreground} size={20} />
                <Text style={[styles.themeOptionText, { color: colors.foreground }]}>Light</Text>
                {themeMode === 'light' && <Check color={colors.primary} size={16} />}
              </Pressable>
              <Pressable
                onPress={() => setThemeMode('dark')}
                style={[
                  styles.themeOption,
                  {
                    borderColor: themeMode === 'dark' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Moon color={themeMode === 'dark' ? colors.primary : colors.foreground} size={20} />
                <Text style={[styles.themeOptionText, { color: colors.foreground }]}>Dark</Text>
                {themeMode === 'dark' && <Check color={colors.primary} size={16} />}
              </Pressable>
              <Pressable
                onPress={() => setThemeMode('system')}
                style={[
                  styles.themeOption,
                  {
                    borderColor: themeMode === 'system' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Smartphone
                  color={themeMode === 'system' ? colors.primary : colors.foreground}
                  size={20}
                />
                <Text style={[styles.themeOptionText, { color: colors.foreground }]}>System</Text>
                {themeMode === 'system' && <Check color={colors.primary} size={16} />}
              </Pressable>
            </View>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell color={colors.foreground} size={20} />
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                  Push Notifications
                </Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>
                Coming Soon
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>
                App Version
              </Text>
              <Text style={[styles.aboutValue, { color: colors.foreground }]}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>Developer</Text>
              <Text style={[styles.aboutValue, { color: colors.foreground }]}>Heaven Rose</Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
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
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
