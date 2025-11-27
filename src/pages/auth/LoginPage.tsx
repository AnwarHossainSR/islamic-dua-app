import { ROUTES } from "@/config/routes";
import { LoginForm } from "@/features/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(ROUTES.DASHBOARD);
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/5 via-background to-accent/10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Heaven Rose Islamic
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your duas and dhikr
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
