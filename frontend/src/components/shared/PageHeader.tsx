'use client'

import { Brain, Activity, Wifi, WifiOff } from 'lucide-react'
import { useAgentStore } from '@/store/agentStore'
import { Badge } from '@/components/ui/badge'

export function PageHeader() {
  const { isConnected, isStreaming } = useAgentStore()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3.5">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="leading-tight">
            <span className="text-[15px] font-bold tracking-tight">HemasMind</span>
            <span className="ml-2 text-xs text-muted-foreground">
              Supply Chain Intelligence
            </span>
          </div>
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-3">
          {isStreaming && (
            <Badge variant="warning" className="gap-1.5 animate-pulse">
              <Activity className="h-3 w-3" />
              Agents Running
            </Badge>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            {isConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-red-400" />
                <span className="text-red-400 font-medium">Disconnected</span>
              </>
            )}
          </div>

          <span className="hidden text-xs text-muted-foreground md:block">
            Hemas Pharmaceuticals Lanka
          </span>
        </div>
      </div>
    </header>
  )
}
