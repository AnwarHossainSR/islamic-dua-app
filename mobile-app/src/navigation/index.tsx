import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Screens
import ActivitiesScreen from "@/screens/ActivitiesScreen";
import ActivityDetailScreen from "@/screens/ActivityDetailScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import SignupScreen from "@/screens/auth/SignupScreen";
import ChallengePreviewScreen from "@/screens/ChallengePreviewScreen";
import ChallengeProgressScreen from "@/screens/ChallengeProgressScreen";
import ChallengesScreen from "@/screens/ChallengesScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import DuaDetailScreen from "@/screens/DuaDetailScreen";
import DuasScreen from "@/screens/DuasScreen";
import SettingsScreen from "@/screens/SettingsScreen";

// Icons
import { Activity, Book, Home, Settings, Target } from "lucide-react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name={ROUTES.DASHBOARD}
        component={DashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.CHALLENGES}
        component={ChallengesScreen}
        options={{
          tabBarLabel: "Challenges",
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.ACTIVITIES}
        component={ActivitiesScreen}
        options={{
          tabBarLabel: "Activities",
          tabBarIcon: ({ color, size }) => (
            <Activity color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.DUAS}
        component={DuasScreen}
        options={{
          tabBarLabel: "Duas",
          tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.CHALLENGE_PROGRESS}
        component={ChallengeProgressScreen}
        options={{ title: "Challenge Progress" }}
      />
      <Stack.Screen
        name={ROUTES.CHALLENGE_PREVIEW}
        component={ChallengePreviewScreen}
        options={{ title: "Challenge Preview" }}
      />
      <Stack.Screen
        name={ROUTES.ACTIVITY_DETAIL}
        component={ActivityDetailScreen}
        options={{ title: "Activity Details" }}
      />
      <Stack.Screen
        name={ROUTES.DUA_DETAIL}
        component={DuaDetailScreen}
        options={{ title: "Dua Details" }}
      />
    </Stack.Navigator>
  );
}

export function Navigation() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.foreground,
          border: colors.border,
          notification: colors.destructive,
        },
        fonts: {
          regular: {
            fontFamily: "System",
            fontWeight: "400",
          },
          medium: {
            fontFamily: "System",
            fontWeight: "500",
          },
          bold: {
            fontFamily: "System",
            fontWeight: "700",
          },
          heavy: {
            fontFamily: "System",
            fontWeight: "800",
          },
        },
      }}
    >
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
