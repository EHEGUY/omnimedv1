'use client';

import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScanningOverlayProps {
  isScanning: boolean;
  className?: string;
}

export function ScanningOverlay({ isScanning, className }: ScanningOverlayProps) {
  if (!isScanning) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center overflow-hidden rounded-xl bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      {/* Scanning Line */}
      <div className="absolute inset-0 z-10 w-full h-[2px] bg-primary shadow-[0_0_15px_3px_hsl(var(--primary))] animate-scanline" />

      {/* Pulsing Rings */}
      <div className="absolute flex items-center justify-center">
        <div className="absolute h-32 w-32 rounded-full border-2 border-primary/50 animate-pulse-ring" />
        <div className="absolute h-48 w-48 rounded-full border-2 border-primary/30 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
        
        {/* Core Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative z-20 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-glow"
        >
          <Activity className="h-8 w-8 text-white" />
        </motion.div>
      </div>
      
      {/* Text Indicator */}
      <div className="absolute bottom-1/4 text-center">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg font-bold text-primary tracking-widest uppercase"
        >
          Analyzing Scan...
        </motion.p>
      </div>
    </motion.div>
  );
}
