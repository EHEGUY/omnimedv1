import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Logo + Tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-cta text-white shadow-glow-sm">
                <Activity className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold text-foreground">
                Omni<span className="text-gradient">Med</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The world&apos;s most advanced local medical AI. Multimodal clinical reasoning that
              never leaves your hardware.
            </p>
          </div>

          {/* Product Links */}
          <FooterCol
            title="Product"
            links={[
              { href: '/patients', label: 'Patient Portal' },
              { href: '/hospitals', label: 'Hospital Dashboard' },
              { href: '/methodology', label: 'Methodology' },
            ]}
          />

          {/* Legal Links */}
          <FooterCol
            title="Legal"
            links={[
              { href: '/', label: 'Privacy Policy' },
              { href: '/', label: 'Terms of Service' },
              { href: '/', label: 'HIPAA Notice' },
            ]}
          />

          {/* Built By */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Built by</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              Team Databaes — engineering offline-first medical intelligence.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} OmniMed AI. All rights reserved.</p>
          <p>
            Powered by <span className="font-medium text-foreground">MedGemma</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
