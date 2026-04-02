"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { SriLankaInteractiveMap } from "@/components/map/SriLankaInteractiveMap";

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />

      <main className="w-full">
        <SriLankaInteractiveMap className="h-[calc(100vh-74px)] w-full" />
      </main>
    </div>
  );
}
