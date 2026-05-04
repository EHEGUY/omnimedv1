'use client';

import { HeroSection } from '../sections/hero';
import { TrustBar } from '../sections/trust-bar';
import { HowItWorks } from '../sections/how-it-works';
import { FeaturesGrid } from '../sections/features';
import { StatsSection } from '../sections/stats';
import { CtaSection } from '../sections/cta';

export default function LandingPage() {
  return (
    <div className="relative">
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <FeaturesGrid />
      <StatsSection />
      <CtaSection />
    </div>
  );
}
