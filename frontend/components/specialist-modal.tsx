'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DoctorCard from '@/components/DoctorCard';
import { Doctor } from '@/types/doctor';

interface SpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPECIALIZATIONS = ['All', 'Dermatology', 'Radiology', 'Neurology', 'Oncology'] as const;

export default function SpecialistModal({ isOpen, onClose }: SpecialistModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchDoctors = async () => {
      setLoading(true); setError(null);
      try {
        const params = filter !== 'All' ? `?specialization=${filter}` : '';
        const res = await fetch(`/api/doctors${params}`);
        if (!res.ok) throw new Error(`Failed to fetch doctors (${res.status})`);
        const data = await res.json();
        setDoctors(data.doctors || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load doctors');
        setDoctors([]);
      } finally { setLoading(false); }
    };
    fetchDoctors();
  }, [isOpen, filter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto glass-card p-8">
        <button onClick={onClose}
          className="absolute right-6 top-6 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" aria-label="Close modal">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-2">Contact a <span className="text-gradient">Specialist</span></h2>
        <p className="text-muted-foreground mb-6">Connect with an experienced medical professional for a second opinion</p>

        {/* Specialization Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SPECIALIZATIONS.map((spec) => (
            <button key={spec} onClick={() => setFilter(spec)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === spec
                  ? 'bg-gradient-cta text-white shadow-glow-sm'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}>
              {spec}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-[80px] w-[80px] rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-9 w-full bg-muted rounded-lg mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-6 border-destructive/50 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-destructive/60 mt-1">Make sure the FastAPI backend is running on port 8000.</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && doctors.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No specialists found for &ldquo;{filter}&rdquo;.</p>
          </div>
        )}

        {/* Doctor Grid */}
        {!loading && !error && doctors.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {doctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
          </div>
        )}

        {/* Privacy Note */}
        <div className="glass-card p-4 mt-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Privacy &amp; Security:</span>{' '}
            The AI&apos;s preliminary findings and your uploaded scan will be securely transmitted to the doctor.
            All data is encrypted and HIPAA-compliant.
          </p>
        </div>
      </div>
    </div>
  );
}
