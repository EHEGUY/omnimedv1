'use client';

import { motion } from 'framer-motion';
import { Upload, Brain, UserCheck } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Scan',
    description: 'X-Ray, MRI, CT scan, or skin photo. Drag & drop or click to browse — your file never leaves your machine.',
  },
  {
    icon: Brain,
    step: '02',
    title: 'AI Analyzes',
    description: 'MedGemma performs multimodal reasoning over your scan locally. No cloud, no latency, no data leaks.',
  },
  {
    icon: UserCheck,
    step: '03',
    title: 'Get Results',
    description: 'Receive structured findings, clinical impressions, and connect with verified specialists for a second opinion.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to AI-powered clinical insights — all running locally on your machine.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-10 lg:gap-16 sm:grid-cols-3 relative">
          {/* Connecting Line (desktop only) */}
          <div className="hidden sm:block absolute top-16 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {steps.map(({ icon: Icon, step, title, description }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="group relative flex flex-col items-center text-center z-10"
            >
              <div className="mb-8 relative">
                {/* Number Watermark */}
                <span className="absolute -top-10 -left-6 text-7xl font-black text-muted-foreground/10 select-none group-hover:text-primary/10 transition-colors duration-500">
                  {step}
                </span>
                
                {/* Icon Container */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-cta text-white shadow-glow transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_hsl(var(--primary))]">
                  <Icon className="h-10 w-10" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
