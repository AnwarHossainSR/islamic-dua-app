'use server'

import { EnhancedAIService } from '@/lib/ai/service'
import { db } from '@/lib/db'
import { aiChatMessages, aiChatSessions } from '@/lib/db/schema'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createChatSession(
  title: string,
  chatMode: 'general' | 'database' = 'general'
) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const [session] = await db
    .insert(aiChatSessions)
    .values({
      user_id: user.id,
      title,
      chat_mode: chatMode,
    })
    .returning()

  return {
    ...session,
    created_at: session.created_at ? new Date(session.created_at).toISOString() : new Date().toISOString(),
    updated_at: session.updated_at ? new Date(session.updated_at).toISOString() : new Date().toISOString(),
  }
}

export async function getChatSessions() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('Auth error in getChatSessions:', error)
    return []
  }

  const sessions = await db
    .select()
    .from(aiChatSessions)
    .where(eq(aiChatSessions.user_id, user.id))
    .orderBy(desc(aiChatSessions.updated_at))

  return sessions.map(session => ({
    ...session,
    created_at: session.created_at ? new Date(session.created_at).toISOString() : new Date().toISOString(),
    updated_at: session.updated_at ? new Date(session.updated_at).toISOString() : new Date().toISOString(),
  }))
}

export async function getChatMessages(sessionId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const messages = await db
    .select()
    .from(aiChatMessages)
    .where(and(eq(aiChatMessages.session_id, sessionId), eq(aiChatMessages.user_id, user.id)))
    .orderBy(aiChatMessages.created_at)

  return messages.map(message => ({
    ...message,
    created_at: message.created_at ? new Date(message.created_at).toISOString() : new Date().toISOString(),
  }))
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  chatMode: 'general' | 'database'
) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get conversation history (last 4 messages)
  const previousMessages = await db
    .select()
    .from(aiChatMessages)
    .where(and(eq(aiChatMessages.session_id, sessionId), eq(aiChatMessages.user_id, user.id)))
    .orderBy(desc(aiChatMessages.created_at))
    .limit(4)

  const conversationHistory = previousMessages.reverse().map(msg => ({
    role: msg.role,
    content: msg.content,
  }))

  // Save user message
  await db.insert(aiChatMessages).values({
    session_id: sessionId,
    user_id: user.id,
    role: 'user',
    content: message,
  })

  // Get AI response with conversation history
  let aiResponse
  if (chatMode === 'database') {
    aiResponse = await EnhancedAIService.askIslamicQuestionWithMCP(
      message,
      user.id,
      conversationHistory
    )
  } else {
    aiResponse = await EnhancedAIService.askGeneralQuestion(message)
  }

  // Save AI response
  await db.insert(aiChatMessages).values({
    session_id: sessionId,
    user_id: user.id,
    role: 'assistant',
    content: aiResponse.message,
    metadata: JSON.stringify({
      relatedDuas: aiResponse.relatedDuas || [],
      suggestions: aiResponse.suggestions || [],
    }),
  })

  // Update session timestamp
  await db
    .update(aiChatSessions)
    .set({ updated_at: Date.now() })
    .where(eq(aiChatSessions.id, sessionId))

  revalidatePath('/ai')
  return aiResponse
}

export async function clearAllChats() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  await db.delete(aiChatSessions).where(eq(aiChatSessions.user_id, user.id))
  revalidatePath('/ai')
}

export async function deleteChatSession(sessionId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  await db
    .delete(aiChatSessions)
    .where(and(eq(aiChatSessions.id, sessionId), eq(aiChatSessions.user_id, user.id)))

  revalidatePath('/ai')
}
