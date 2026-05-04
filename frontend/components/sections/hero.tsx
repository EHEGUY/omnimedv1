'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Dot grid pattern */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Floating glow orbs with framer motion */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px]"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md"
          >
            <Activity className="h-4 w-4 animate-pulse" />
            Powered by MedGemma — 100% Local AI
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            The World&apos;s Most Advanced{' '}
            <span className="text-gradient drop-shadow-lg">Local Medical AI.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl font-medium"
          >
            Multimodal clinical reasoning running entirely on your hardware.
            Secure, offline, and instant.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6"
          >
            <Link
              href="/patients"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta px-8 py-4 text-base font-bold text-white shadow-glow transition-all hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary))]"
            >
              Start Diagnosis
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/hospitals"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40"
            >
              Enterprise Solutions
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
