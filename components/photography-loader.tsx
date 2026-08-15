"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion"

type Phase = "loading" | "opening" | "exiting"

interface PhotographyLoaderProps {
  /** Called once the loader has fully faded away. */
  onComplete?: () => void
  /** Approximate loading duration in milliseconds. Default ~2700ms. */
  duration?: number
  /** Background image revealed behind the aperture. */
  imageSrc?: string
}

const BLADE_COUNT = 6
const EASE = [0.22, 1, 0.36, 1] as const

/** A single curved iris blade, pointing toward the center at the top. */
function ApertureBlade({ open }: { open: number }) {
  // Closed: blades sit near the center. Open: they slide outward.
  const translate = -40 - open * 150
  return (
    <motion.path
      d="M -104 -18 Q 0 -70 104 -18 L 62 -196 Q 0 -214 -62 -196 Z"
      fill="url(#bladeGradient)"
      stroke="rgba(201,162,75,0.22)"
      strokeWidth={1}
      animate={{ y: translate }}
      transition={{ duration: 1.6, ease: EASE }}
      style={{ transformBox: "fill-box" }}
    />
  )
}

export default function PhotographyLoader({
  onComplete,
  duration = 2700,
  imageSrc = "/images/hero.png",
}: PhotographyLoaderProps) {
  const prefersReduced = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>("loading")
  const [visible, setVisible] = useState(true)
  const rafRef = useRef<number | null>(null)

  const finish = useCallback(() => {
    setVisible(false)
  }, [])

  // Drive the loading percentage with an eased ramp.
  useEffect(() => {
    if (prefersReduced) {
      setProgress(100)
      setPhase("opening")
      const t1 = setTimeout(() => setPhase("exiting"), 400)
      const t2 = setTimeout(finish, 900)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }

    let start: number | null = null
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      setProgress(Math.round(easeInOut(t) * 100))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setPhase("opening")
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [duration, prefersReduced, finish])

  // After the aperture opens, hold briefly then exit.
  useEffect(() => {
    if (phase !== "opening") return
    const t = setTimeout(() => setPhase("exiting"), 650)
    return () => clearTimeout(t)
  }, [phase])

  const apertureOpen = phase === "loading" ? 0.18 : 1
  const imageSharp = phase === "loading" ? progress / 100 : 1

  const containerVariants: Variants = {
    visible: { opacity: 1 },
    exiting: {
      opacity: 0,
      scale: prefersReduced ? 1 : 1.12,
      filter: prefersReduced ? "blur(0px)" : "blur(6px)",
      transition: { duration: 1.1, ease: EASE },
    },
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="photography-loader"
          role="status"
          aria-live="polite"
          aria-label={`Loading portfolio, ${progress} percent`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background"
          variants={containerVariants}
          initial="visible"
          animate={phase === "exiting" ? "exiting" : "visible"}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE } }}
          onAnimationComplete={(def) => {
            if (def === "exiting") finish()
          }}
        >
          {/* Background photograph — starts blurred, sharpens with progress */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "loading" ? 0.28 + imageSharp * 0.32 : 0.72,
              scale: prefersReduced ? 1 : 1.08 - imageSharp * 0.05,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: prefersReduced
                ? "none"
                : `blur(${18 - imageSharp * 16}px) grayscale(${0.5 - imageSharp * 0.5})`,
            }}
          />
          {/* Vignette + grain */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(10,10,11,0.35) 0%, rgba(10,10,11,0.85) 55%, rgba(10,10,11,0.97) 100%)",
            }}
          />
          <div
            aria-hidden
            className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
          />

          {/* Aperture */}
          <div className="relative flex flex-col items-center">
            <div className="relative h-64 w-64 sm:h-72 sm:w-72">
              {/* Glowing focus ring */}
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow:
                    "0 0 60px 2px rgba(201,162,75,0.25), inset 0 0 40px rgba(201,162,75,0.12)",
                  border: "1px solid rgba(201,162,75,0.35)",
                }}
                animate={
                  prefersReduced
                    ? {}
                    : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.02, 1] }
                }
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                aria-hidden
                className="absolute inset-3 rounded-full border border-white/5"
                animate={prefersReduced ? {} : { rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />

              {/* Rotating iris blades */}
              <motion.svg
                viewBox="0 0 400 400"
                className="absolute inset-0 h-full w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
              >
                <defs>
                  <linearGradient id="bladeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1c1c1f" />
                    <stop offset="100%" stopColor="#0d0d0f" />
                  </linearGradient>
                  <radialGradient id="apertureCore" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(228,205,143,0.18)" />
                    <stop offset="100%" stopColor="rgba(228,205,143,0)" />
                  </radialGradient>
                </defs>
                <circle cx="200" cy="200" r="150" fill="url(#apertureCore)" />
                <motion.g
                  animate={prefersReduced ? {} : { rotate: 360 }}
                  transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ originX: "200px", originY: "200px" }}
                >
                  {Array.from({ length: BLADE_COUNT }).map((_, i) => (
                    <g
                      key={i}
                      transform={`rotate(${(360 / BLADE_COUNT) * i} 200 200) translate(200 200)`}
                    >
                      <ApertureBlade open={apertureOpen} />
                    </g>
                  ))}
                </motion.g>
              </motion.svg>
            </div>

            {/* Wordmark */}
            <motion.div
              className="mt-10 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: EASE }}
            >
              <h1 className="font-serif text-4xl font-light tracking-[0.4em] text-foreground sm:text-5xl">
                ABISHEK
              </h1>
              <p className="mt-3 text-[0.7rem] uppercase tracking-[0.45em] text-muted sm:text-xs">
                Photography <span className="text-gold">·</span> Stories{" "}
                <span className="text-gold">·</span> Emotions
              </p>
            </motion.div>

            {/* Progress */}
            <motion.div
              className="mt-10 flex w-56 flex-col items-center gap-3 sm:w-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <div className="flex w-full items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-muted">
                <span>Loading</span>
                <span className="tabular-nums text-foreground">{progress}%</span>
              </div>
              <div className="h-px w-full overflow-hidden bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold-soft"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
