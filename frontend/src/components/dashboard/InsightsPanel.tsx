import { AlertTriangle, Eye, Lightbulb, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Insight } from '@/types/hemas-mind-payload'

const typeIcons = {
  observation: Eye,
  recommendation: Lightbulb,
  risk: AlertTriangle,
  opportunity: TrendingUp,
} as const

const severityBadge = {
  info: 'default',
  warning: 'warning',
  critical: 'critical',
} as const

const agentColour: Record<string, string> = {
  sentinel: 'text-blue-400',
  orchestrator: 'text-purple-400',
  operator: 'text-cyan-400',
  communicator: 'text-emerald-400',
}

interface InsightsPanelProps {
  insights: Insight[]
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          AI Insights
          <Badge variant="secondary" className="ml-auto text-xs">
            {insights.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {insights.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No insights yet. Trigger an agent run to generate analysis.
          </p>
        ) : (
          insights.map((insight) => {
            const Icon = typeIcons[insight.type]
            return (
              <div
                key={insight.id}
                className="flex gap-3 rounded-md border border-border/50 bg-secondary/40 p-3"
              >
                <Icon
                  className={cn(
                    'mt-0.5 h-4 w-4 flex-shrink-0',
                    insight.severity === 'critical' && 'text-red-400',
                    insight.severity === 'warning' && 'text-amber-400',
                    insight.severity === 'info' && 'text-muted-foreground'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <Badge variant={severityBadge[insight.severity]} className="text-xs capitalize">
                      {insight.type}
                    </Badge>
                    <span
                      className={cn(
                        'text-xs capitalize',
                        agentColour[insight.source] ?? 'text-muted-foreground'
                      )}
                    >
                      {insight.source}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{insight.text}</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
