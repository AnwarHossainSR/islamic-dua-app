import type { ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface RouteWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireLayout?: boolean;
}

export function RouteWrapper({
  children,
  requireAuth = false,
  requireLayout = true,
}: RouteWrapperProps) {
  let content = children;

  if (requireLayout) {
    content = <Layout>{content}</Layout>;
  }

  if (requireAuth) {
    content = <ProtectedRoute>{content}</ProtectedRoute>;
  }

  return <>{content}</>;
}
