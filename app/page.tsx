"use client"

import { useEffect, useState } from "react"
import PhotographyLoader from "@/components/photography-loader"
import PortfolioHome from "@/components/portfolio-home"

const SESSION_KEY = "abishek-loaded"

export default function Page() {
  // `null` until we know whether this is the initial load (avoids flashes).
  const [showLoader, setShowLoader] = useState<boolean | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem(SESSION_KEY) === "true"
    if (alreadyLoaded) {
      setShowLoader(false)
      setRevealed(true)
    } else {
      setShowLoader(true)
    }
  }, [])

  const handleComplete = () => {
    sessionStorage.setItem(SESSION_KEY, "true")
    setShowLoader(false)
  }

  if (showLoader === null) {
    // First paint before hydration decision — keep it dark, no flash.
    return <div className="min-h-screen bg-background" />
  }

  return (
    <>
      <PortfolioHome active={revealed || !showLoader} />
      {showLoader && (
        <PhotographyLoader
          onComplete={handleComplete}
          // Begin revealing the homepage a touch before the loader fully exits.
          duration={2700}
        />
      )}
      {/* Trigger the homepage reveal as the loader begins its exit. */}
      {showLoader && <RevealBridge onReveal={() => setRevealed(true)} />}
    </>
  )
}

/** Small helper that flips the homepage to "active" shortly before the loader exits. */
function RevealBridge({ onReveal }: { onReveal: () => void }) {
  useEffect(() => {
    const t = setTimeout(onReveal, 3100)
    return () => clearTimeout(t)
  }, [onReveal])
  return null
}
