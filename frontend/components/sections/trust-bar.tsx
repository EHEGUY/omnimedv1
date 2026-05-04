'use client';

import { motion } from 'framer-motion';
import { Shield, Cpu, CloudOff, BadgeCheck } from 'lucide-react';

const trustItems = [
  { icon: Shield, label: 'HIPAA Compliant' },
  { icon: Cpu, label: '100% Local Processing' },
  { icon: CloudOff, label: 'Zero Cloud Data' },
  { icon: BadgeCheck, label: 'NMC Verified Doctors' },
];

export function TrustBar() {
  return (
    <section className="border-b border-border/50 bg-card/40 backdrop-blur-md relative z-10">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {trustItems.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 text-sm text-muted-foreground group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold tracking-wide uppercase group-hover:text-foreground transition-colors">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
