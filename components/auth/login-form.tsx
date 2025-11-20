'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginAction } from '@/lib/actions/forms'
import { resendConfirmationEmail } from '@/lib/actions/auth'
import Link from 'next/link'
import { useActionState, useState, Activity } from 'react'
import { useFormStatus } from 'react-dom'
import { BiometricLogin } from './biometric-login'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const [state, formAction] = useActionState(loginAction, { error: '', code: '' })
  const [email, setEmail] = useState('')
  const [resendingEmail, setResendingEmail] = useState(false)
  const [success, setSuccess] = useState('')
  
  const needsEmailConfirmation = state.error && state.code === 'email_not_confirmed'

  async function handleResendConfirmation() {
    if (!email) return
    
    setResendingEmail(true)
    setSuccess('')

    try {
      const result = await resendConfirmationEmail(email)
      if (result?.success) {
        setSuccess(result.message || 'Confirmation email sent!')
      }
    } catch (err) {
      // Handle error
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <Card className="w-full flex justify-center">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4 pb-5">
          <Activity mode={state.error ? 'visible' : 'hidden'}>
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          </Activity>
          <Activity mode={success ? 'visible' : 'hidden'}>
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </Activity>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <BiometricLogin
            onError={() => {}}
            onSuccess={() => setSuccess('Signed in successfully!')}
          />
          <Activity mode={needsEmailConfirmation ? 'visible' : 'hidden'}>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleResendConfirmation}
              disabled={resendingEmail}
            >
              {resendingEmail ? 'Sending...' : 'Resend Confirmation Email'}
            </Button>
          </Activity>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}