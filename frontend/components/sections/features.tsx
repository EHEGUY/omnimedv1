'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  MessageSquare,
  Eye,
  Users,
  Wifi,
} from 'lucide-react';

const features = [
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
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesGrid() {
  return (
    <section className="py-32 bg-card/40 border-y border-border/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">
              Built for <span className="text-gradient">Clinical Excellence</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything a modern medical AI platform needs — with privacy as the absolute foundation.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              className="group glass-card p-8 transition-all duration-500 hover:shadow-glow-sm hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Hover gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 transition-all duration-300 group-hover:bg-gradient-cta group-hover:text-white group-hover:shadow-glow-sm group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
