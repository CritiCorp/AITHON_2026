import { Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InsightsPanelProps {
  insights: string[]
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
          <ul className="space-y-2">
            {insights.map((text, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-md border border-border/50 bg-secondary/40 p-3 text-sm leading-relaxed"
              >
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                {text}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
