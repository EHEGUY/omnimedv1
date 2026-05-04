'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="py-32 border-t border-border/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">
            Ready to experience the future of{' '}
            <span className="text-gradient">medical AI</span>?
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Start your first diagnosis in seconds. No sign-up required — everything runs locally with absolute privacy.
          </p>
          
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Link
              href="/patients"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta px-8 py-4 text-lg font-bold text-white shadow-glow transition-all hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary))]"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-card/50 px-8 py-4 text-lg font-bold text-foreground transition-all hover:bg-muted/50 hover:border-muted-foreground/30"
            >
              Read Our Methodology
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
