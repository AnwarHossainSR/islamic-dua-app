import { LoginForm } from "@/components/auth/login-form"
import { getUser } from "@/lib/actions/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const user = await getUser()

  if (user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Heaven Rose Islamic</h1>
          <p className="text-muted-foreground">Sign in to access your duas and dhikr</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
