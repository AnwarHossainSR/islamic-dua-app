'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import {
  clearAllChats,
  createChatSession,
  getChatMessages,
  sendChatMessage,
} from '@/lib/actions/ai-chat'
import { renderMarkdown } from '@/lib/utils/markdown-renderer'
import {
  Brain,
  Database,
  Globe,
  History,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: string
  created_at: string
}

interface ChatSession {
  id: string
  title: string
  chat_mode: 'general' | 'database'
  created_at: string
}

interface ImprovedIslamicChatProps {
  initialSessions: ChatSession[]
  hasOpenAIKey: boolean
}

export function ImprovedIslamicChat({ initialSessions, hasOpenAIKey }: ImprovedIslamicChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatMode, setChatMode] = useState<'general' | 'database'>('database')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (sessionId: string) => {
    try {
      const sessionMessages = await getChatMessages(sessionId)
      const formattedMessages: ChatMessage[] = sessionMessages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        metadata: msg.metadata || undefined,
        created_at: msg.created_at || new Date().toISOString(),
      }))
      setMessages(formattedMessages)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      })
    }
  }

  const createNewSession = async () => {
    try {
      const title = `Chat ${new Date().toLocaleDateString()}`
      const session = await createChatSession(title, chatMode)
      const formattedSession = {
        ...session,
        created_at: session.created_at || new Date().toISOString(),
        updated_at: session.updated_at || new Date().toISOString(),
      }
      setSessions(prev => [formattedSession, ...prev])
      setCurrentSession(formattedSession)
      setMessages([])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        variant: 'destructive',
      })
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading || !hasOpenAIKey) return

    const messageText = input.trim()
    setInput('')
    setLoading(true)

    let session = currentSession
    if (!session) {
      try {
        const title = messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '')
        const newSession = await createChatSession(title, chatMode)
        const formattedSession = {
          ...newSession,
          created_at: newSession.created_at || new Date().toISOString(),
          updated_at: newSession.updated_at || new Date().toISOString(),
        }
        setSessions(prev => [formattedSession, ...prev])
        setCurrentSession(formattedSession)
        session = formattedSession
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create chat session',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await sendChatMessage(session.id, messageText, chatMode)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        metadata: JSON.stringify({
          relatedDuas: response.relatedDuas || [],
          suggestions: response.suggestions || [],
        }),
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'I apologize, but I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllChats()
      setSessions([])
      setCurrentSession(null)
      setMessages([])
      toast({
        title: 'Success',
        description: 'All chats cleared',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear chats',
        variant: 'destructive',
      })
    }
  }

  const quickQuestions = [
    'What dua should I recite before eating?',
    'Tell me about Fajr prayer',
    'What are the benefits of morning dhikr?',
    'What dua for traveling?',
    'How to perform wudu properly?',
    'Evening duas and their benefits',
  ]

  if (!hasOpenAIKey) {
    return (
      <div className="h-full flex items-center justify-center ">
        <Card className="p-8 text-center max-w-md">
          <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">AI Assistant Unavailable</h3>
          <p className="text-muted-foreground mb-4">
            Configure OpenAI API key to enable AI features
          </p>
          <Button variant="outline" asChild>
            <a href="/settings">Configure Settings</a>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-background relative touch-pan-y ">
      {/* Chat Area */}
      <div className="flex-1 flex min-w-0 ">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 ">
          {/* Chat Header */}
          <div className="border-b px-2 py-4 bg-card md:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    chatMode === 'database' ? 'bg-primary/10' : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}
                >
                  {chatMode === 'database' ? (
                    <Database className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  ) : (
                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-xl font-semibold truncate">
                    {chatMode === 'database' ? 'Islamic AI Assistant' : 'General AI Assistant'}
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {chatMode === 'database'
                      ? 'Ask me anything about Islamic prayers, duas, or spiritual guidance'
                      : 'Ask me anything - general knowledge, advice, or help with tasks'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {/* Chat Mode Toggle */}
                <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm">
                  <span
                    className={
                      chatMode === 'database' ? 'text-primary font-medium' : 'text-muted-foreground'
                    }
                  >
                    Islamic
                  </span>
                  <Switch
                    checked={chatMode === 'database'}
                    onCheckedChange={checked => setChatMode(checked ? 'database' : 'general')}
                  />
                  <span
                    className={
                      chatMode === 'general' ? 'text-blue-600 font-medium' : 'text-muted-foreground'
                    }
                  >
                    General
                  </span>
                </div>

                {/* History Toggle Button */}
                <Button onClick={() => setSidebarOpen(!sidebarOpen)} variant="outline" size="sm">
                  <History className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">History</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-scroll overflow-x-hidden px-0 py-4 md:px-6 min-h-0 scrollbar-hide"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div
                    className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      chatMode === 'database'
                        ? 'bg-gradient-to-br from-primary/10 to-primary/20'
                        : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'
                    }`}
                  >
                    <Sparkles
                      className={`h-10 w-10 ${
                        chatMode === 'database'
                          ? 'text-primary'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Welcome to {chatMode === 'database' ? 'Islamic' : 'General'} AI Assistant
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {chatMode === 'database'
                      ? 'Ask me anything about Islam, duas, prayers, or spiritual guidance'
                      : 'Ask me anything - I can help with various topics and questions'}
                  </p>
                </div>

                {chatMode === 'database' && (
                  <div className="grid gap-3 max-w-md mx-auto">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Try these questions:
                    </p>
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(question)}
                        className="text-left justify-start h-auto p-3 hover:bg-primary/5"
                      >
                        <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                        <span className="text-sm">{question}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 md:gap-3 max-w-[95%] md:max-w-[85%] ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : chatMode === 'database'
                            ? 'bg-primary/10'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <span className="text-xs font-bold">You</span>
                        ) : (
                          <Brain
                            className={`h-4 w-4 ${
                              chatMode === 'database'
                                ? 'text-primary'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl p-3 md:p-4 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-card border rounded-bl-md'
                        }`}
                      >
                        <div className="text-sm leading-relaxed ai-message">
                          {(() => {
                            try {
                              if (message.metadata) {
                                const parsed = JSON.parse(message.metadata)
                                if (parsed.relatedDuas && parsed.relatedDuas.length > 0) {
                                  return (
                                    <div className="space-y-4">
                                      <div className="whitespace-pre-wrap">{message.content}</div>
                                      <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 text-primary font-medium mb-3">
                                          <Database className="h-4 w-4" />
                                          <span>Related Duas</span>
                                        </div>
                                        {parsed.relatedDuas.map((dua: any, index: number) => (
                                          <div
                                            key={index}
                                            className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-3"
                                          >
                                            <h4 className="font-medium text-primary mb-2">
                                              {dua.title}
                                            </h4>
                                            <div className="text-right mb-3 p-3 bg-card rounded border">
                                              <div className="font-arabic text-xl leading-loose text-green-800 dark:text-green-200">
                                                {dua.arabic}
                                              </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                              <div className="font-medium text-xs mb-1">
                                                Bengali Translation:
                                              </div>
                                              {dua.translation}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                }
                              }
                            } catch {
                              // Not JSON, render as regular text
                            }
                            return <div>{renderMarkdown(message.content)}</div>
                          })()}
                        </div>
                        <div
                          className={`text-xs mt-2 ${
                            message.role === 'user'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          chatMode === 'database'
                            ? 'bg-primary/10'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}
                      >
                        <Brain
                          className={`h-4 w-4 ${
                            chatMode === 'database'
                              ? 'text-primary'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}
                        />
                      </div>
                      <div className="bg-card border rounded-2xl rounded-bl-md p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`animate-spin h-4 w-4 border-2 border-t-transparent rounded-full ${
                              chatMode === 'database' ? 'border-primary' : 'border-blue-500'
                            }`}
                          />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t px-2 py-4 bg-card md:px-6">
            <div className="flex gap-2 md:gap-3 items-end max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !loading) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={
                    chatMode === 'database'
                      ? 'Ask about duas, prayers, or Islamic guidance... (Press Enter to send)'
                      : 'Ask me anything... (Press Enter to send)'
                  }
                  disabled={loading}
                  rows={1}
                  className="w-full min-h-[56px] max-h-32 resize-none rounded-2xl border-2 border-input bg-background px-4 py-3 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  style={{ height: 'auto' }}
                  onInput={e => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl transition-all duration-200 ${
                    chatMode === 'database'
                      ? 'bg-primary hover:bg-primary/90 hover:scale-105'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 hover:scale-105'
                  } ${!input.trim() ? 'opacity-50' : 'opacity-100'}`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat History */}
        <div
          className={`fixed top-[113px] right-0 bottom-0 w-full max-w-sm bg-card border-l transform transition-transform duration-300 ease-in-out z-30 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Chat History</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={createNewSession}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
              <Button onClick={() => setSidebarOpen(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {sessions.map(session => (
                <Button
                  key={session.id}
                  variant={currentSession?.id === session.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => {
                    setCurrentSession(session)
                    loadMessages(session.id)
                    setSidebarOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {session.chat_mode === 'database' ? (
                      <Database className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{session.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Clear All Button */}
          {sessions.length > 0 && (
            <div className="p-4 border-t">
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-20" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  )
}
