// @system — Command Palette (Cmd+K / Ctrl+K)
// Global keyboard-driven search and navigation for power users.
// Supports search, recent items, quick actions, and keyboard navigation.

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Home,
  Settings,
  CreditCard,
  Key,
  Activity,
  Users,
  HelpCircle,
  FileText,
  ArrowRight,
  Command,
  CornerDownLeft,
} from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'

const DEFAULT_COMMANDS = [
  {
    id: 'dashboard',
    label: 'Go to Dashboard',
    icon: Home,
    category: 'Navigation',
    action: (navigate) => navigate('/app'),
    keywords: ['home', 'main'],
  },
  {
    id: 'settings',
    label: 'Open Settings',
    icon: Settings,
    category: 'Navigation',
    action: (navigate) => navigate('/app/settings'),
    keywords: ['preferences', 'profile'],
  },
  {
    id: 'billing',
    label: 'Billing & Plans',
    icon: CreditCard,
    category: 'Navigation',
    action: (navigate) => navigate('/app/billing'),
    keywords: ['payment', 'subscription', 'plan'],
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: Key,
    category: 'Navigation',
    action: (navigate) => navigate('/app/api-keys'),
    keywords: ['token', 'key'],
  },
  {
    id: 'activity',
    label: 'Activity Log',
    icon: Activity,
    category: 'Navigation',
    action: (navigate) => navigate('/app/activity'),
    keywords: ['log', 'history'],
  },
  {
    id: 'teams',
    label: 'Manage Teams',
    icon: Users,
    category: 'Navigation',
    action: (navigate) => navigate('/app/teams'),
    keywords: ['team', 'members', 'invite'],
  },
  {
    id: 'help',
    label: 'Help Center',
    icon: HelpCircle,
    category: 'Support',
    action: (navigate) => navigate('/help'),
    keywords: ['support', 'docs', 'documentation'],
  },
  {
    id: 'docs',
    label: 'API Documentation',
    icon: FileText,
    category: 'Support',
    action: () => window.open('/docs', '_blank'),
    keywords: ['api', 'reference'],
  },
]

/**
 * CommandPalette — Global keyboard shortcut search & navigation
 * @param {Object} props
 * @param {Array} [props.commands] - Additional custom commands
 * @param {Function} [props.onSearch] - Custom search handler for async results
 * @param {string} [props.placeholder] - Search input placeholder
 */
export function CommandPalette({
  commands: customCommands = [],
  onSearch,
  placeholder = 'Type a command or search…',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentCommands, setRecentCommands] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('command-palette-recent') || '[]')
    } catch {
      return []
    }
  })
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  const allCommands = [...DEFAULT_COMMANDS, ...customCommands]

  // Filter commands based on query
  const filteredCommands = query.trim()
    ? allCommands.filter((cmd) => {
        const searchStr = `${cmd.label} ${cmd.category} ${(cmd.keywords || []).join(' ')}`.toLowerCase()
        return query
          .toLowerCase()
          .split(' ')
          .every((term) => searchStr.includes(term))
      })
    : recentCommands.length > 0
      ? [
          ...recentCommands
            .map((id) => allCommands.find((c) => c.id === id))
            .filter(Boolean)
            .slice(0, 3),
          ...allCommands.slice(0, 5),
        ]
      : allCommands.slice(0, 8)

  // Group commands by category
  const grouped = filteredCommands.reduce((acc, cmd) => {
    const cat = cmd.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(cmd)
    return acc
  }, {})

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]')
      active?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const executeCommand = useCallback(
    (cmd) => {
      // Track recent
      const updated = [cmd.id, ...recentCommands.filter((id) => id !== cmd.id)].slice(0, 5)
      setRecentCommands(updated)
      localStorage.setItem('command-palette-recent', JSON.stringify(updated))

      setIsOpen(false)
      cmd.action(navigate)
    },
    [navigate, recentCommands]
  )

  const handleKeyDown = (e) => {
    const flatItems = filteredCommands
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % flatItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = flatItems[activeIndex]
      if (cmd) executeCommand(cmd)
    }
  }

  if (!isOpen) return null

  let itemIndex = -1

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-[15%] z-50 mx-auto w-full max-w-lg animate-in fade-in-0 slide-in-from-top-4 duration-200">
        <div className="overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : (
              Object.entries(grouped).map(([category, commands]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  {commands.map((cmd) => {
                    itemIndex++
                    const idx = itemIndex
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.id}
                        data-active={idx === activeIndex}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left',
                          idx === activeIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-accent/50'
                        )}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{cmd.label}</span>
                        {idx === activeIndex && (
                          <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↵</kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="h-3 w-3" />K to toggle
            </span>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
