'use server'

import { db } from '@/lib/db'
import { aiChatSessions, aiChatMessages, challengeTemplates, userChallengeProgress } from '@/lib/db/schema'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { eq, desc, and } from 'drizzle-orm'
import { AIService } from '@/lib/ai/service'
import { getDuas } from './duas'
import { revalidatePath } from 'next/cache'

export async function createChatSession(title: string, chatMode: 'general' | 'database' = 'general') {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const [session] = await db.insert(aiChatSessions).values({
    user_id: user.id,
    title,
    chat_mode: chatMode,
  }).returning()

  return {
    ...session,
    created_at: session.created_at?.toISOString() || new Date().toISOString(),
    updated_at: session.updated_at?.toISOString() || new Date().toISOString(),
  }
}

export async function getChatSessions() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('Auth error in getChatSessions:', error)
    return []
  }

  const sessions = await db.select().from(aiChatSessions)
    .where(eq(aiChatSessions.user_id, user.id))
    .orderBy(desc(aiChatSessions.updated_at))

  return sessions.map(session => ({
    ...session,
    created_at: session.created_at?.toISOString() || new Date().toISOString(),
    updated_at: session.updated_at?.toISOString() || new Date().toISOString(),
  }))
}

export async function getChatMessages(sessionId: string) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const messages = await db.select().from(aiChatMessages)
    .where(and(
      eq(aiChatMessages.session_id, sessionId),
      eq(aiChatMessages.user_id, user.id)
    ))
    .orderBy(aiChatMessages.created_at)

  return messages.map(message => ({
    ...message,
    created_at: message.created_at?.toISOString() || new Date().toISOString(),
  }))
}

export async function sendChatMessage(sessionId: string, message: string, chatMode: 'general' | 'database') {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Save user message
  await db.insert(aiChatMessages).values({
    session_id: sessionId,
    user_id: user.id,
    role: 'user',
    content: message,
  })

  // Get AI response
  let aiResponse
  if (chatMode === 'database') {
    aiResponse = await AIService.askIslamicQuestionWithMCP(message, user.id)
  } else {
    aiResponse = await AIService.askGeneralQuestion(message)
  }

  // Save AI response
  await db.insert(aiChatMessages).values({
    session_id: sessionId,
    user_id: user.id,
    role: 'assistant',
    content: aiResponse.message,
    metadata: JSON.stringify({
      relatedDuas: aiResponse.relatedDuas || [],
      suggestions: aiResponse.suggestions || []
    }),
  })

  // Update session timestamp
  await db.update(aiChatSessions)
    .set({ updated_at: new Date() })
    .where(eq(aiChatSessions.id, sessionId))

  revalidatePath('/ai')
  return aiResponse
}

export async function clearAllChats() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  await db.delete(aiChatSessions).where(eq(aiChatSessions.user_id, user.id))
  revalidatePath('/ai')
}

export async function deleteChatSession(sessionId: string) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  await db.delete(aiChatSessions)
    .where(and(
      eq(aiChatSessions.id, sessionId),
      eq(aiChatSessions.user_id, user.id)
    ))

  revalidatePath('/ai')
}

async function getUserContextForAI(userId: string) {
  try {
    // Get user's recent challenge progress
    const recentProgress = await db.select({
      challengeTitle: challengeTemplates.title_bn,
      status: userChallengeProgress.status,
      currentDay: userChallengeProgress.current_day,
      currentStreak: userChallengeProgress.current_streak,
      totalDays: challengeTemplates.total_days,
    })
    .from(userChallengeProgress)
    .innerJoin(challengeTemplates, eq(userChallengeProgress.challenge_id, challengeTemplates.id))
    .where(eq(userChallengeProgress.user_id, userId))
    .limit(5)

    return {
      recentProgress,
      userId
    }
  } catch (error) {
    console.error('Error getting user context:', error)
    return { recentProgress: [], userId }
  }
}