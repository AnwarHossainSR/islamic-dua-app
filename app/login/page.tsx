import { LoginForm } from '@/components/auth/login-form'
import { getUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>
}) {
  const user = await getUser()
  const params = await searchParams

  if (user) {
    // If already logged in, redirect to return URL or home
    redirect(params.returnUrl || '/')
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Heaven Rose Islamic</h1>
          <p className="text-muted-foreground">Sign in to access your duas and dhikr</p>
        </div>
        <LoginForm returnUrl={params.returnUrl} />
      </div>
    </div>
  )
}
