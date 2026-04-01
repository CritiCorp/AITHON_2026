'use client'

import { useEffect, useRef } from 'react'
import { Bot, Terminal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgentStore } from '@/store/agentStore'
import { cn } from '@/lib/utils'
import type { AgentThought, ThoughtType } from '@/types/hemas-mind-payload'

// ── Per-agent terminal colours ────────────────────────────────
const agentColour: Record<string, string> = {
  sentinel:     'text-blue-400',
  orchestrator: 'text-purple-400',
  operator:     'text-cyan-400',
  communicator: 'text-emerald-400',
}

// ── Emoji prefixes per thought type ──────────────────────────
const thoughtPrefix: Record<ThoughtType, string> = {
  thought:     '💭',
  action:      '⚡',
  observation: '👁',
  result:      '✅',
  error:       '❌',
}

// ── Single log line ───────────────────────────────────────────
function ThoughtLine({ thought }: { thought: AgentThought }) {
  const colour = agentColour[thought.agent] ?? 'text-muted-foreground'
  const prefix = thoughtPrefix[thought.type]
  const time = new Date(thought.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="flex gap-2 py-0.5 font-mono text-xs leading-relaxed">
      <span className="flex-shrink-0 tabular-nums text-muted-foreground/50">{time}</span>
      <span className={cn('flex-shrink-0 font-semibold capitalize', colour)}>
        [{thought.agent}]
      </span>
      <span className="flex-shrink-0">{prefix}</span>
      <span
        className={cn(
          'break-words',
          thought.type === 'error' ? 'text-red-400' : 'text-foreground/75'
        )}
      >
        {thought.message}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export function AgentThoughtStream() {
  const { thoughts, isStreaming } = useAgentStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to newest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thoughts.length])

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Terminal className="h-4 w-4 text-primary" />
          Agent Thought Stream
          {isStreaming && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-normal text-blue-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              Live
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <div className="terminal-scroll h-72 overflow-y-auto rounded-md border border-border/50 bg-background/60 p-3">
          {thoughts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Bot className="h-8 w-8 opacity-25" />
              <p className="text-xs">Waiting for agent activity…</p>
            </div>
          ) : (
            <>
              {thoughts.map((t) => (
                <ThoughtLine key={t.id} thought={t} />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
