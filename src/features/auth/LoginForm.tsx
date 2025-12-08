import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
import { BiometricLogin } from "./BiometricLogin";

async function loginAction(_: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await authApi.signIn(email, password);
    toast.success("Signed in successfully!");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4 pb-5">
          {state?.error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded border border-destructive/20">
              {state.error}
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <BiometricLogin
            onError={(error) => toast.error(error)}
            onSuccess={() => toast.success("Signed in successfully!")}
          />

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to={ROUTES.SIGNUP} className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
