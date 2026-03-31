'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

interface SpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpecialistModal({ isOpen, onClose }: SpecialistModalProps) {
  if (!isOpen) return null;

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen, MD',
      specialty: 'Lead Radiologist',
      experience: '12 Years Experience',
      status: 'Available Now',
      statusColor: 'bg-green-100 text-green-800',
      image: '/dr-sarah-chen.jpg',
      phone: '555-0198',
      buttonText: 'Connect via Call (555-0198)',
      buttonStyle: 'bg-green-600 hover:bg-green-700 text-white',
    },
    {
      id: 2,
      name: 'Dr. Marcus Thorne',
      specialty: 'Orthopedic Specialist',
      experience: '8 Years Experience',
      status: '5 Min Wait',
      statusColor: 'bg-blue-100 text-blue-800',
      image: '/dr-marcus-thorne.jpg',
      phone: null,
      buttonText: 'Request Review',
      buttonStyle: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-1 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Available Specialists Matching Your Scan
        </h2>
        <p className="text-gray-600 mb-8">
          Connect with an experienced medical professional for a second opinion
        </p>

        {/* Doctors List */}
        <div className="space-y-6 mb-8">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-6">
                {/* Doctor Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    width={120}
                    height={120}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500 mt-1">{doctor.experience}</p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${doctor.statusColor}`}>
                      {doctor.status}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`px-6 py-3 rounded-lg font-semibold text-sm transition-colors ${doctor.buttonStyle}`}
                  >
                    {doctor.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Note */}
        <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-gray-900">Privacy & Security:</span> The AI's preliminary findings and your uploaded scan will be securely transmitted to the doctor. All data is encrypted and HIPAA-compliant.
          </p>
        </div>
      </div>
    </div>
  );
}
