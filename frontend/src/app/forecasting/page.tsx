'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ChartFactory } from '@/components/analytics/ChartFactory'
import { KpiRow } from '@/components/dashboard/KpiRow'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { ConfidenceIndicator } from '@/components/agent/ConfidenceIndicator'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePayloadStore } from '@/store/payloadStore'

export default function ForecastingPage() {
  const { current: payload } = usePayloadStore()

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="max-w-screen-2xl mx-auto w-full flex-1 space-y-5 px-6 py-6">

        {!payload ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No Forecast Available</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                Run the AI analysis pipeline first to generate demand forecasts.
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                <Play className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold">
                      PharmaCast — {payload.layout.title}
                    </CardTitle>
                    {payload.layout.summary && (
                      <CardDescription className="mt-1 text-xs leading-relaxed">
                        {payload.layout.summary}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                    <ConfidenceIndicator
                      score={payload.metadata.confidence_score}
                      model_used={payload.metadata.model_used}
                    />
                    {payload.layout.date_range && (
                      <span className="text-xs text-muted-foreground">
                        {payload.layout.date_range}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {payload.kpis?.length > 0 && <KpiRow kpis={payload.kpis} />}

                {(payload.charts ?? []).map((spec) => (
                  <div key={spec.id} className="h-[500px]">
                    <ChartFactory spec={spec} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <InsightsPanel insights={payload.insights ?? []} />
          </>
        )}
      </main>
    </div>
  )
}
