'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '4', label: 'Departments Supported' },
  { value: '96%+', label: 'Accuracy Target' },
  { value: '0', label: 'Data Sent to Cloud' },
  { value: '24/7', label: 'Instant Analysis' },
];

export function StatsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="inline-block relative">
                <p className="text-5xl font-black text-gradient sm:text-6xl tracking-tight relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {value}
                </p>
                {/* Subtle glow behind text */}
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <p className="mt-4 text-base font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
