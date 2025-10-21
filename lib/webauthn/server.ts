'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { apiLogger } from '../logger'

export interface WebAuthnCredential {
  id: string
  user_id: string
  credential_id: string
  public_key: string
  counter: number
  created_at: string
}

export async function storeCredential(
  userId: string,
  credentialId: string,
  publicKey: string,
  counter: number
) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('webauthn_credentials')
    .insert({
      user_id: userId,
      credential_id: credentialId,
      public_key: publicKey,
      counter: counter,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCredential(credentialId: string): Promise<WebAuthnCredential | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('webauthn_credentials')
    .select('*')
    .eq('credential_id', credentialId)
    .single()

  if (error) {
    apiLogger.error('Supabase error while fetching credential', { error: error.message })
    return null
  }
  return data
}

export async function getUserCredentials(userId: string): Promise<WebAuthnCredential[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('webauthn_credentials')
    .select('*')
    .eq('user_id', userId)

  if (error) return []
  return data || []
}

export async function updateCredentialCounter(credentialId: string, counter: number) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('webauthn_credentials')
    .update({ counter })
    .eq('credential_id', credentialId)

  if (error) throw error
}
