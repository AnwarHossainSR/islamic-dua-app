import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/features/auth/LoginForm'
import { ROUTES } from '@/config/routes'
import { APP_NAME } from '@/constants'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate(ROUTES.DASHBOARD)
  }, [user, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Heaven Rose Islamic</h1>
          <p className="text-muted-foreground">Sign in to access your duas and dhikr</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
