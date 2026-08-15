"use client"

import { useState } from "react"
import PhotographyLoader from "@/components/photography-loader"

export default function Page() {
  // Remount the loader each time it completes so the animation loops on-screen.
  const [cycle, setCycle] = useState(0)

  return (
    <main className="min-h-screen bg-background">
      <PhotographyLoader
        key={cycle}
        duration={2700}
        onComplete={() => {
          // Brief pause on the finished frame, then replay from the top.
          setTimeout(() => setCycle((c) => c + 1), 900)
        }}
      />
    </main>
  )
}
