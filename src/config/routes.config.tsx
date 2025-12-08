import type { ComponentType } from "react";
import { ROUTES } from "@/config/routes";
import ActivitiesPage from "@/pages/activities/ActivitiesPage";
import ActivityDetailPage from "@/pages/activities/ActivityDetailPage";
import AIPage from "@/pages/ai/AIPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ChallengeFormPage from "@/pages/challenges/ChallengeFormPage";
import ChallengePreviewPage from "@/pages/challenges/ChallengePreviewPage";
import ChallengeProgressPage from "@/pages/challenges/ChallengeProgressPage";
import ChallengesPage from "@/pages/challenges/ChallengesPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import DuaAddPage from "@/pages/duas/DuaAddPage";
import DuaDetailPage from "@/pages/duas/DuaDetailPage";
import DuaEditPage from "@/pages/duas/DuaEditPage";
import DuasPage from "@/pages/duas/DuasPage";
import LogsPage from "@/pages/logs/LogsPage.tsx";
import MissedChallengesPage from "@/pages/missed-challenges/MissedChallengesPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import PermissionsManagementPage from "@/pages/users/PermissionsManagementPage";
import UserPermissionsPage from "@/pages/users/UserPermissionsPage";
import UsersPage from "@/pages/users/UsersPage";

export interface RouteConfig {
  path: string;
  component: ComponentType;
  requireAuth?: boolean;
  requireLayout?: boolean;
}

export const routes: RouteConfig[] = [
  // Public routes
  { path: ROUTES.LOGIN, component: LoginPage, requireLayout: false },
  { path: ROUTES.SIGNUP, component: SignupPage, requireLayout: false },

  // Protected routes
  { path: ROUTES.DASHBOARD, component: DashboardPage, requireAuth: true },
  { path: ROUTES.CHALLENGES, component: ChallengesPage, requireAuth: true },
  { path: "/challenges/:id", component: ChallengeFormPage, requireAuth: true },
  { path: "/challenges/:id/preview", component: ChallengePreviewPage },
  {
    path: "/challenges/progress/:id",
    component: ChallengeProgressPage,
    requireAuth: true,
  },

  // Activities
  { path: ROUTES.ACTIVITIES, component: ActivitiesPage, requireAuth: true },
  { path: "/activities/:id", component: ActivityDetailPage, requireAuth: true },

  // Duas
  { path: ROUTES.DUAS, component: DuasPage, requireAuth: true },
  { path: "/duas/add", component: DuaAddPage, requireAuth: true },
  { path: "/duas/:id", component: DuaDetailPage, requireAuth: true },
  { path: "/duas/:id/edit", component: DuaEditPage, requireAuth: true },

  // Settings & Misc
  { path: ROUTES.SETTINGS, component: SettingsPage, requireAuth: true },
  {
    path: ROUTES.MISSED_CHALLENGES,
    component: MissedChallengesPage,
    requireAuth: true,
  },

  // Admin
  { path: ROUTES.ADMIN_USERS, component: UsersPage, requireAuth: true },
  {
    path: "/users/:id/permissions",
    component: UserPermissionsPage,
    requireAuth: true,
  },
  {
    path: "/users/permissions",
    component: PermissionsManagementPage,
    requireAuth: true,
  },
  { path: ROUTES.ADMIN_LOGS, component: LogsPage, requireAuth: true },

  // AI
  { path: "/ai", component: AIPage, requireAuth: true },
];
