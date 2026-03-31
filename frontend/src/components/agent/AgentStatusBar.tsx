'use client'

import { useAgentStore } from '@/store/agentStore'
import { cn } from '@/lib/utils'
import type { AgentName, AgentStatus } from '@/types/hemas-mind-payload'

const AGENTS: { name: AgentName; label: string; description: string }[] = [
  { name: 'sentinel',     label: 'Sentinel',     description: 'Web intelligence' },
  { name: 'orchestrator', label: 'Orchestrator', description: 'Decision engine' },
  { name: 'operator',     label: 'Operator',     description: 'ML inference' },
  { name: 'communicator', label: 'Communicator', description: 'Payload builder' },
]

const dotClass: Record<AgentStatus, string> = {
  idle:      'bg-muted-foreground/40',
  running:   'bg-blue-400 animate-pulse',
  completed: 'bg-emerald-400',
  error:     'bg-red-400',
}

const labelClass: Record<AgentStatus, string> = {
  idle:      'text-muted-foreground',
  running:   'text-blue-400',
  completed: 'text-emerald-400',
  error:     'text-red-400',
}

const statusLabel: Record<AgentStatus, string> = {
  idle:      'Idle',
  running:   'Running',
  completed: 'Done',
  error:     'Error',
}

export function AgentStatusBar() {
  const { statuses } = useAgentStore()

  return (
    <div className="flex flex-wrap gap-2">
      {AGENTS.map(({ name, label, description }) => {
        const status = statuses[name]
        return (
          <div
            key={name}
            className="flex items-center gap-2 rounded-md border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs"
          >
            <span className={cn('h-1.5 w-1.5 flex-shrink-0 rounded-full', dotClass[status])} />
            <span className="font-medium">{label}</span>
            <span className="hidden text-muted-foreground sm:inline">{description}</span>
            <span className={cn('font-semibold', labelClass[status])}>
              {statusLabel[status]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
