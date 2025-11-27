import { Link } from 'react-router-dom'
import { SignupForm } from '@/features/auth/SignupForm'
import { ROUTES } from '@/config/routes'
import { APP_NAME } from '@/constants'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Heaven Rose Islamic</h1>
          <p className="text-muted-foreground">Create an account to save your favorite duas</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
