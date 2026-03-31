'use client'

import { useState } from 'react'
import {
  ArrowLeftRight,
  Bell,
  CheckCircle,
  ChevronRight,
  Loader2,
  ShoppingCart,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useActionHandler } from '@/hooks/useActionHandler'
import type { Action } from '@/types/hemas-mind-payload'

const actionIcons: Record<Action['type'], React.ElementType> = {
  generate_po: ShoppingCart,
  notify_supplier: Bell,
  redistribute_stock: ArrowLeftRight,
  custom: ChevronRight,
}

interface ActionsPanelProps {
  actions: Action[]
}

export function ActionsPanel({ actions }: ActionsPanelProps) {
  const { handleAction, getActionState } = useActionHandler()
  const [confirming, setConfirming] = useState<string | null>(null)

  const onActionClick = async (action: Action) => {
    if (action.requiresConfirmation && confirming !== action.id) {
      setConfirming(action.id)
      return
    }
    setConfirming(null)
    await handleAction(action)
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ChevronRight className="h-4 w-4 text-primary" />
          Recommended Actions
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {actions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No actions available. Run agents to generate recommendations.
          </p>
        ) : (
          actions.map((action) => {
            const state = getActionState(action.id)
            const Icon = actionIcons[action.type]
            const isConfirming = confirming === action.id

            return (
              <div key={action.id} className="space-y-2">
                {/* Action row */}
                <div className="flex items-center gap-3 rounded-md border border-border/50 bg-secondary/30 p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>

                  {state.result?.success ? (
                    <Badge variant="success" className="flex-shrink-0 gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Done
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant={
                        action.variant === 'primary'
                          ? 'default'
                          : action.variant === 'destructive'
                          ? 'destructive'
                          : 'secondary'
                      }
                      disabled={state.isLoading}
                      onClick={() => onActionClick(action)}
                      className="flex-shrink-0"
                    >
                      {state.isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isConfirming ? (
                        'Confirm?'
                      ) : (
                        'Run'
                      )}
                    </Button>
                  )}
                </div>

                {/* Inline confirmation */}
                {isConfirming && (
                  <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                    <span className="flex-1 text-xs text-amber-300">
                      {action.confirmationMessage ?? 'Are you sure you want to proceed?'}
                    </span>
                    <Button size="sm" onClick={() => onActionClick(action)}>
                      Yes, proceed
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirming(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Error feedback */}
                {state.error && (
                  <p className="px-3 text-xs text-red-400">{state.error}</p>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
