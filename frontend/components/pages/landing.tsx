'use client';

type View = 'home' | 'patients' | 'hospitals';

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-32">
        {/* Headline */}
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          The World's Most Advanced Local Medical AI.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
          Multimodal clinical reasoning running entirely on your local hardware. Secure, offline, and instant.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4">
          <button
            onClick={() => onNavigate('patients')}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Patient Portal
          </button>
          <button
            onClick={() => onNavigate('hospitals')}
            className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 px-8 py-3 text-base font-semibold text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            Enterprise Solutions
          </button>
        </div>
      </section>
    </div>
  );
}
