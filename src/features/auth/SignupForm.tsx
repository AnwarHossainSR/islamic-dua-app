import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/api";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

async function signupAction(_: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    await authApi.signUp(email, password);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up to start your spiritual journey</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4 pb-5">
          {state?.error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded border border-destructive/20">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 p-3 rounded border border-emerald-500/20">
              Check your email to confirm your account
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              className={cn(
                "block w-full px-3 py-2 border border-input rounded-md bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className={cn(
                  "block w-full px-3 py-2 pr-10 border border-input rounded-md bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className={cn(
                  "block w-full px-3 py-2 pr-10 border border-input rounded-md bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
