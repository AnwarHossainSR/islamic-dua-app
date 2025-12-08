import { supabase } from "@/lib/supabase/client";

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  chat_mode: "general" | "database";
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: string;
  created_at: string;
}

export const chatApi = {
  async createSession(
    title: string,
    chatMode: "general" | "database" = "database"
  ): Promise<ChatSession> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("ai_chat_sessions")
      .insert({
        user_id: user.id,
        title,
        chat_mode: chatMode,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSessions(): Promise<ChatSession[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(
    sessionId: string,
    message: string,
    chatMode: "general" | "database"
  ): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Save user message
    await supabase.from("ai_chat_messages").insert({
      session_id: sessionId,
      user_id: user.id,
      role: "user",
      content: message,
    });

    // Call AI endpoint
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message, chatMode, userId: user.id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get AI response");
    }

    const aiResponse = await response.json();

    // Save AI response
    await supabase.from("ai_chat_messages").insert({
      session_id: sessionId,
      user_id: user.id,
      role: "assistant",
      content: aiResponse.message,
      metadata: JSON.stringify({
        relatedDuas: aiResponse.relatedDuas || [],
        suggestions: aiResponse.suggestions || [],
      }),
    });

    // Update session timestamp
    await supabase
      .from("ai_chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    return aiResponse;
  },

  async clearAll(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("ai_chat_sessions").delete().eq("user_id", user.id);

    if (error) throw error;
  },
};
