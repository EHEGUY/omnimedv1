'use client';

import { useState } from 'react';
import { Doctor } from '@/types/doctor';
import { Building2, Star, Phone } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

/** Generates initials from a doctor's name, e.g. "Dr. Priya Sharma" → "PS" */
function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() ?? '?';
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [showContact, setShowContact] = useState(false);
  const initials = getInitials(doctor.name);

  // Generate a consistent dummy phone number based on doctor ID
  const hash = doctor.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dummyPhone = `+91 98${hash % 90 + 10} 2${doctor.id.slice(-3).padStart(3, '0').replace(/\D/g, '0')}`;

  return (
    <div className="glass-card p-5 transition-all duration-300 hover:shadow-glow-sm hover:scale-[1.01] group">
      <div className="flex gap-4">
        {/* Photo / Initials Avatar */}
        <div className="flex-shrink-0">
          <div className="h-[80px] w-[80px] rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center gradient-border">
            <img src={doctor.photo} alt={doctor.name} className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('span');
                  fallback.textContent = initials;
                  fallback.className = 'text-xl font-bold text-primary';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium text-foreground truncate">{doctor.name}</h3>
          <p className="text-[13px] text-muted-foreground truncate mt-0.5">{doctor.designation}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-[13px] font-medium text-foreground">{doctor.rating.toFixed(1)}</span>
            <span className="text-[12px] text-muted-foreground">({doctor.reviews_count} reviews)</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-[13px] text-muted-foreground truncate">{doctor.hospital}</span>
          </div>
        </div>
      </div>

      {/* Language badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {doctor.languages.map(lang => (
          <span key={lang} className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{lang}</span>
        ))}
      </div>

      {/* Fee + Availability */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className="text-[14px] font-semibold text-foreground">₹{doctor.consultation_fee.toLocaleString('en-IN')}</span>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${doctor.available ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-muted-foreground'}`} />
          <span className={`text-[12px] font-medium ${doctor.available ? 'text-green-400' : 'text-muted-foreground'}`}>
            {doctor.available ? 'Available today' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* NMC Registration */}
      <p className="text-[11px] text-muted-foreground/60 mt-2">NMC Reg: {doctor.nmc_registration}</p>

      {/* Contact Button */}
      <button 
        className={`mt-3 w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${
          showContact 
            ? 'bg-muted text-foreground border border-border cursor-default' 
            : 'bg-gradient-cta text-white shadow-glow-sm opacity-90 hover:opacity-100 hover:shadow-glow hover:scale-[1.01]'
        }`}
        onClick={() => setShowContact(true)}>
        {showContact ? (
          <>
            <Phone className="h-4 w-4 text-primary" />
            <a href={`tel:${dummyPhone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
              {dummyPhone}
            </a>
          </>
        ) : (
          'Show Contact Number'
        )}
      </button>
    </div>
  );
}
