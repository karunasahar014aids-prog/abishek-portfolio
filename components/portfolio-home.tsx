"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

const navItems = ["Work", "Series", "About", "Contact"]

export default function PortfolioHome({ active }: { active: boolean }) {
  const prefersReduced = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: EASE },
    },
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Hero image */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ scale: prefersReduced ? 1 : 1.15, opacity: 0 }}
        animate={active ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 2.2, ease: EASE }}
        style={{
          backgroundImage: "url(/images/hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />
      {/* Legibility gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,11,0.55) 0%, rgba(10,10,11,0.25) 40%, rgba(10,10,11,0.85) 100%)",
        }}
      />
      <div
        aria-hidden
        className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-screen"
      />

      {/* Navigation */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12"
        initial={{ opacity: 0, y: -16 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: EASE, delay: 0.3 }}
      >
        <span className="font-serif text-lg tracking-[0.35em] text-foreground">
          ABISHEK
        </span>
        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="group relative text-xs uppercase tracking-[0.25em] text-muted transition-colors hover:text-foreground"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <button
          className="text-xs uppercase tracking-[0.25em] text-muted transition-colors hover:text-foreground md:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
      </motion.header>

      {/* Hero copy */}
      <motion.section
        className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col justify-center px-6 sm:px-12"
        variants={container}
        initial="hidden"
        animate={active ? "show" : "hidden"}
      >
        <motion.p
          variants={item}
          className="mb-6 text-xs uppercase tracking-[0.5em] text-gold"
        >
          Visual Storyteller
        </motion.p>
        <motion.h1
          variants={item}
          className="max-w-4xl font-serif text-5xl font-light leading-[1.05] text-balance sm:text-7xl lg:text-8xl"
        >
          Capturing light,
          <br />
          <span className="text-gold-soft">emotion</span> & the
          <br />
          in-between.
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-8 max-w-md text-base leading-relaxed text-muted"
        >
          A photographer devoted to quiet, cinematic frames — where every image
          holds a story worth remembering.
        </motion.p>
        <motion.div variants={item} className="mt-12">
          <a
            href="#work"
            className="group inline-flex items-center gap-4 border border-gold/40 px-8 py-4 text-xs uppercase tracking-[0.3em] text-foreground transition-colors duration-300 hover:bg-gold hover:text-background"
          >
            Explore Portfolio
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </motion.div>
      </motion.section>

      {/* Bottom meta bar */}
      <motion.div
        className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-muted sm:left-12 sm:right-12"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : {}}
        transition={{ delay: 1, duration: 1 }}
      >
        <span>Est. 2019 — Chennai, IN</span>
        <span className="hidden sm:inline">Scroll to explore ↓</span>
      </motion.div>
    </main>
  )
}
