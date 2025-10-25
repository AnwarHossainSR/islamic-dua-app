'use client'

import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  callback: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey
        const altMatch = !!shortcut.altKey === event.altKey
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault()
          shortcut.callback()
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Common shortcuts
export const commonShortcuts = {
  save: { key: 's', ctrlKey: true, description: 'Save (Ctrl+S)' },
  search: { key: 'k', ctrlKey: true, description: 'Search (Ctrl+K)' },
  newItem: { key: 'n', ctrlKey: true, description: 'New Item (Ctrl+N)' },
  refresh: { key: 'r', ctrlKey: true, description: 'Refresh (Ctrl+R)' },
  fullscreen: { key: 'f', ctrlKey: true, description: 'Fullscreen (Ctrl+F)' },
  escape: { key: 'Escape', description: 'Close/Cancel (Esc)' },
}