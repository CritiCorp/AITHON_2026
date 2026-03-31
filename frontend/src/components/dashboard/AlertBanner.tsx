'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, Package, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Alert } from '@/types/hemas-mind-payload'

interface AlertBannerProps {
  alert: Alert
}

export function AlertBanner({ alert }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const isCritical = alert.severity === 'critical'

  return (
    <div
      className={cn(
        'relative rounded-lg border px-5 py-4',
        isCritical
          ? 'border-red-500/30 bg-red-500/10 text-red-100'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-100'
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className={cn('mt-0.5 flex-shrink-0', isCritical ? 'text-red-400' : 'text-amber-400')}>
          {isCritical ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </span>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isCritical ? 'critical' : 'warning'}>
              {isCritical ? 'CRITICAL' : 'WARNING'}
            </Badge>
            <span className="text-sm font-semibold">{alert.title}</span>
            {alert.daysUntilStockout !== undefined && (
              <Badge variant="critical" className="gap-1">
                Stockout in {alert.daysUntilStockout}d
              </Badge>
            )}
          </div>

          <p className="mt-1.5 text-sm opacity-90 leading-relaxed">{alert.message}</p>

          {alert.affectedProducts.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Package className="h-3 w-3 opacity-60" />
              {alert.affectedProducts.map((product) => (
                <span
                  key={product}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-xs opacity-80"
                >
                  {product}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss */}
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
