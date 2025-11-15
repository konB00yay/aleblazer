"use client"

import { AleForm } from "@/components/aleForm";
import dynamic from 'next/dynamic'

export default function Home() {

  const Map = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => <p>Loading map...</p>
})

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <AleForm />
        <Map center={[40.7128, -74.0060]} zoom={12} />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
