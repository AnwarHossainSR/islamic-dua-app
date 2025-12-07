import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FullPageLoader } from "@/components/ui";
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
import { AppProviders } from "@/providers";
import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AppProviders>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Header />
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            <Route
              path={ROUTES.HOME}
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CHALLENGES}
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChallengesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChallengeFormPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges/:id/preview"
              element={
                <Layout>
                  <ChallengePreviewPage />
                </Layout>
              }
            />
            <Route
              path="/challenges/progress/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChallengeProgressPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ACTIVITIES}
              element={
                <ProtectedRoute>
                  <Layout>
                    <ActivitiesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ActivityDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DUAS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <DuasPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/duas/add"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DuaAddPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/duas/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DuaDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/duas/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DuaEditPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.MISSED_CHALLENGES}
              element={
                <ProtectedRoute>
                  <Layout>
                    <MissedChallengesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_USERS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/permissions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserPermissionsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/permissions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PermissionsManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ADMIN_LOGS}
              element={
                <ProtectedRoute>
                  <Layout>
                    <LogsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AIPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  );
}
