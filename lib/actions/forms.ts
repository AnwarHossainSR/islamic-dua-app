'use server'

import { redirect } from 'next/navigation'
import { signIn, signUp } from './auth'
import { updateActivityCount } from './admin'
import { revalidatePath } from 'next/cache'

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const result = await signIn(email, password)
  
  if (result?.error) {
    return { error: result.error, code: result.code }
  }
  
  redirect('/')
}

export async function signupAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const result = await signUp(email, password)
  
  if (result?.error) {
    return { error: result.error }
  }
  
  return { success: true, message: 'Account created successfully!' }
}

export async function updateActivityCountAction(prevState: any, formData: FormData) {
  const activityId = formData.get('activityId') as string
  const newCount = parseInt(formData.get('count') as string, 10)
  
  if (isNaN(newCount) || newCount < 0) {
    return { error: 'Invalid count value' }
  }
  
  const result = await updateActivityCount(activityId, newCount)
  
  if (result.success) {
    revalidatePath(`/activities/${activityId}`)
  }
  
  return result
}