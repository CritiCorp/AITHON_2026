import { PageHeader } from '@/components/shared/PageHeader'

export default function ForecastingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="max-w-screen-2xl mx-auto w-full flex-1 px-6 py-6">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <h1 className="text-2xl font-bold">PharmaCast</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Detailed demand forecasting view. Coming soon.
          </p>
        </div>
      </main>
    </div>
  )
}
