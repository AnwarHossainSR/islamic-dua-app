import React from 'react'

export function renderMarkdown(text: string): React.ReactNode {
  // Simple markdown renderer for AI responses
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let currentList: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (currentList.length > 0) {
      const ListComponent = listType === 'ol' ? 'ol' : 'ul'
      elements.push(
        <ListComponent key={elements.length} className="my-3 pl-6">
          {currentList.map((item, idx) => (
            <li key={idx} className="mb-1">{item}</li>
          ))}
        </ListComponent>
      )
      currentList = []
      listType = null
    }
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    if (!trimmedLine) {
      flushList()
      elements.push(<br key={`br-${index}`} />)
      return
    }

    // Headers
    if (trimmedLine.startsWith('# ')) {
      flushList()
      elements.push(
        <h1 key={index} className="text-lg font-bold mb-2 mt-4">
          {trimmedLine.slice(2)}
        </h1>
      )
      return
    }
    
    if (trimmedLine.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={index} className="text-base font-semibold mb-2 mt-3">
          {trimmedLine.slice(3)}
        </h2>
      )
      return
    }

    // Unordered lists
    if (trimmedLine.match(/^[-*+]\s/)) {
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      currentList.push(trimmedLine.slice(2))
      return
    }

    // Ordered lists
    if (trimmedLine.match(/^\d+\.\s/)) {
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      currentList.push(trimmedLine.replace(/^\d+\.\s/, ''))
      return
    }

    // Blockquotes
    if (trimmedLine.startsWith('> ')) {
      flushList()
      elements.push(
        <blockquote key={index} className="border-l-4 border-primary pl-4 my-2 italic">
          {trimmedLine.slice(2)}
        </blockquote>
      )
      return
    }

    // Code blocks
    if (trimmedLine.startsWith('```')) {
      flushList()
      // Simple code block handling - would need more complex logic for multi-line
      return
    }

    // Regular paragraphs
    flushList()
    
    // Handle inline formatting
    let formattedText = trimmedLine
    
    // Bold text
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Italic text
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Inline code
    formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')

    elements.push(
      <p key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: formattedText }} />
    )
  })

  flushList()
  return <>{elements}</>
}