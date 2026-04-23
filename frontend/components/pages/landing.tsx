'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Shield,
  Cpu,
  CloudOff,
  BadgeCheck,
  Brain,
  MessageSquare,
  Eye,
  Users,
  Wifi,
  LayoutDashboard,
  Upload,
  UserCheck,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-hero">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 dot-grid opacity-40" />

        {/* Floating glow orbs */}
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[100px] animate-float" />
        <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-accent/10 blur-[100px] animate-float delay-300" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary animate-fade-in-up">
              <Activity className="h-3.5 w-3.5" />
              Powered by MedGemma — 100% Local AI
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl animate-fade-in-up delay-100">
              The World&apos;s Most Advanced{' '}
              <span className="text-gradient">Local Medical AI.</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl animate-fade-in-up delay-200">
              Multimodal clinical reasoning running entirely on your hardware.
              Secure, offline, and instant.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4 animate-fade-in-up delay-300">
              <Link
                href="/patients"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta px-8 py-3.5 text-base font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow hover:scale-[1.02]"
              >
                Start Diagnosis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/hospitals"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
              >
                Enterprise Solutions
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════
          TRUST BAR
          ═══════════════════════════════════════════ */}
      <section className="border-b border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: Shield, label: 'HIPAA Compliant' },
              { icon: Cpu, label: '100% Local Processing' },
              { icon: CloudOff, label: 'Zero Cloud Data' },
              { icon: BadgeCheck, label: 'NMC Verified Doctors' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary/70" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Three simple steps to AI-powered clinical insights — all running locally on your machine.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
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
            ].map(({ icon: Icon, step, title, description }, i) => (
              <div
                key={step}
                className="group relative glass-card p-8 transition-all duration-300 hover:shadow-glow-sm hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: `${(i + 1) * 150}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta text-white shadow-glow-sm transition-shadow group-hover:shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-4xl font-black text-muted-foreground/20">{step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES GRID
          ═══════════════════════════════════════════ */}
      <section className="py-24 bg-card/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Built for <span className="text-gradient">Clinical Excellence</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Everything a modern medical AI platform needs — with privacy as the foundation.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: LayoutDashboard,
                title: 'Multi-Department Support',
                description: 'Radiology, Neurology, Dermatology, and Oncology — each with department-tuned prompts and structured reports.',
              },
              {
                icon: MessageSquare,
                title: 'Conversational Follow-ups',
                description: 'Chat with the AI about your results. Ask clarifying questions and get contextual answers in real-time.',
              },
              {
                icon: Eye,
                title: 'Grad-CAM Explainability',
                description: 'See exactly where the neural network focused during classification — visual proof of AI reasoning.',
              },
              {
                icon: Users,
                title: 'Specialist Referral Network',
                description: 'Connect with NMC-verified doctors filtered by specialty. Securely share AI findings with your chosen specialist.',
              },
              {
                icon: Wifi,
                title: '100% Offline Capable',
                description: 'No internet required. All reasoning happens on your local hardware — your data never touches a server.',
              },
              {
                icon: Shield,
                title: 'HIPAA-Grade Security',
                description: 'End-to-end encryption, zero cloud storage, and complete data sovereignty. Built for enterprise compliance.',
              },
            ].map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="group glass-card p-6 transition-all duration-300 hover:shadow-glow-sm hover:scale-[1.01]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 transition-all group-hover:bg-gradient-cta group-hover:text-white group-hover:shadow-glow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS SECTION
          ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '4', label: 'Departments Supported' },
              { value: '96%+', label: 'Accuracy Target' },
              { value: '0', label: 'Data Sent to Cloud' },
              { value: '24/7', label: 'Instant Analysis' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-black text-gradient sm:text-5xl">{value}</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════ */}
      <section className="py-24 border-t border-border/50">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ready to experience the future of{' '}
            <span className="text-gradient">medical AI</span>?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start your first diagnosis in seconds. No sign-up required — everything runs locally.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/patients"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta px-8 py-3.5 text-base font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card/50 px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-muted/50"
            >
              Read Our Methodology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
