"use client"

import type React from "react"

import { useState } from "react"
import { signIn, resendConfirmationEmail } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setNeedsEmailConfirmation(false)
    setLoading(true)

    try {
      const result = await signIn(email, password)
      if (result?.error) {
        setError(result.error)
        if (result.code === "email_not_confirmed") {
          setNeedsEmailConfirmation(true)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function handleResendConfirmation() {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setResendingEmail(true)
    setError("")
    setSuccess("")

    try {
      const result = await resendConfirmationEmail(email)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message || "Confirmation email sent!")
      }
    } catch (err) {
      setError("Failed to resend confirmation email")
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          {needsEmailConfirmation && (
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleResendConfirmation}
              disabled={resendingEmail}
            >
              {resendingEmail ? "Sending..." : "Resend Confirmation Email"}
            </Button>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
