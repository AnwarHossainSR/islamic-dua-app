'use server'

import { getSupabaseServerClient, getSupabaseAdminServerClient } from '@/lib/supabase/server'
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
  counter: number,
  deviceName?: string
) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('webauthn_credentials')
    .insert({
      user_id: userId,
      credential_id: credentialId,
      public_key: publicKey,
      counter: counter,
      device_name: deviceName || 'Unknown Device',
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
    .limit(1)

  if (error) {
    apiLogger.error('Supabase error while fetching credential', { error: error.message })
    return null
  }
  apiLogger.info('Supabase credential fetched', { data })
  return data?.[0] || null
}

export async function getUserCredentials(userId: string): Promise<WebAuthnCredential[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('webauthn_credentials')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    apiLogger.error('Supabase error while fetching user credentials', { error: error })
    return []
  }
  return data || []
}

export async function updateCredentialCounter(credentialId: string, counter: number) {
  const supabase = getSupabaseAdminServerClient()

  const { error } = await supabase
    .from('webauthn_credentials')
    .update({
      counter,
      last_used_at: new Date().toISOString(),
    })
    .eq('credential_id', credentialId)

  if (error) {
    apiLogger.error('Failed to update credential counter', { credentialId, error: error.message })
    throw error
  }
  
  apiLogger.info('Credential counter updated', { credentialId, counter })
}

export async function deleteCredential(credentialId: string, userId: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('webauthn_credentials')
    .delete()
    .eq('credential_id', credentialId)
    .eq('user_id', userId)

  if (error) {
    apiLogger.error('Supabase error while deleting credential', { error: error })
    throw error
  }
}
