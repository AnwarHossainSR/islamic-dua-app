'use client'

import { Button } from '@/components/ui/button'
import { askIslamicQuestion } from '@/lib/actions/ai-recommendations'
import { AIChatMessage } from '@/lib/types/ai'
import { BookOpen, Brain, MessageCircle, Send, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function IslamicChat() {
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await askIslamicQuestion(input.trim())

      const assistantMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Add related duas if any
      if (response.relatedDuas && response.relatedDuas.length > 0) {
        const duasMessage: AIChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: JSON.stringify({
            type: 'duas',
            duas: response.relatedDuas,
          }),
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, duasMessage])
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Islamic AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Ask me anything about Islamic prayers, duas, or spiritual guidance
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to Islamic AI Assistant</h3>
                <p className="text-muted-foreground mb-6">
                  Ask me anything about Islam, duas, prayers, or spiritual guidance
                </p>
              </div>

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
                    className="text-left justify-start h-auto p-3 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <span className="text-xs font-bold">You</span>
                    ) : (
                      <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-white dark:bg-slate-800 border rounded-bl-md'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {(() => {
                        try {
                          const parsed = JSON.parse(message.content)
                          if (parsed.type === 'duas') {
                            return (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium mb-3">
                                  <BookOpen className="h-4 w-4" />
                                  <span>Related Duas</span>
                                </div>
                                {parsed.duas.map((dua: any, index: number) => (
                                  <div
                                    key={index}
                                    className="border border-blue-100 dark:border-blue-800 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-950/20"
                                  >
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                      {dua.title}
                                    </h4>
                                    <div className="text-right mb-3 p-3 bg-white dark:bg-slate-800 rounded border">
                                      <div className="font-arabic text-xl leading-loose text-green-800 dark:text-green-200">
                                        {dua.arabic}
                                      </div>
                                    </div>
                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded">
                                      <div className="font-medium text-xs text-slate-500 dark:text-slate-400 mb-1">
                                        Bengali Translation:
                                      </div>
                                      {dua.translation}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          }
                        } catch {
                          // Not JSON, render as regular text
                        }
                        return <div className="whitespace-pre-wrap">{message.content}</div>
                      })()}
                    </div>
                    <div
                      className={`text-xs mt-2 ${
                        message.role === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-white dark:bg-slate-800 border rounded-2xl rounded-bl-md p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t px-6 py-4">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about duas, prayers, or Islamic guidance..."
                disabled={loading}
                rows={1}
                className="w-full min-h-[60px] max-h-32 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ height: 'auto' }}
                onInput={e => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="icon"
              className="h-[60px] w-[60px] rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
