'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AlertBanner as AlertBannerType } from '@/types/hemas-mind-payload'

interface AlertBannerProps {
  alert: AlertBannerType
}

const levelConfig = {
  critical: {
    container: 'border-red-500/30 bg-red-500/10 text-red-100',
    icon: 'text-red-400',
    badge: 'critical' as const,
    Icon: AlertCircle,
    label: 'CRITICAL',
  },
  warning: {
    container: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    icon: 'text-amber-400',
    badge: 'warning' as const,
    Icon: AlertTriangle,
    label: 'WARNING',
  },
  info: {
    container: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
    icon: 'text-blue-400',
    badge: 'default' as const,
    Icon: Info,
    label: 'INFO',
  },
} as const

export function AlertBanner({ alert }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const cfg = levelConfig[alert.level]
  const { Icon } = cfg

  return (
    <div
      className={cn('relative rounded-lg border px-5 py-4', cfg.container)}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 flex-shrink-0', cfg.icon)}>
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={cfg.badge}>{cfg.label}</Badge>
            <span className="text-sm font-semibold">{alert.title}</span>
            {alert.source && (
              <span className="text-xs opacity-60">via {alert.source}</span>
            )}
          </div>

          <p className="mt-1.5 text-sm opacity-90 leading-relaxed">{alert.message}</p>

          {alert.detected_at && (
            <p className="mt-1 text-xs opacity-60">
              Detected: {new Date(alert.detected_at).toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 opacity-50 transition-opacity hover:opacity-100"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
