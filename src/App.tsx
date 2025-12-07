import { Header } from "@/components/Header";
import { RouteWrapper } from "@/components/RouteWrapper";
import { FullPageLoader } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { routes } from "@/config/routes.config";
import { AppProviders } from "@/providers";
import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AppProviders>
      <Toaster position="top-right" />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Header />
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* Redirect home to dashboard */}
            <Route
              path={ROUTES.HOME}
              element={<Navigate to={ROUTES.DASHBOARD} replace />}
            />

            {/* Dynamic routes from configuration */}
            {routes.map(
              ({ path, component: Component, requireAuth, requireLayout }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <RouteWrapper
                      requireAuth={requireAuth}
                      requireLayout={requireLayout}
                    >
                      <Component />
                    </RouteWrapper>
                  }
                />
              )
            )}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  );
}
