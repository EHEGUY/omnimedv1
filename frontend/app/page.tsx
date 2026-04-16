'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import LandingPage from '@/components/pages/landing';
import PatientPortal from '@/components/pages/patient-portal';
import HospitalPortal from '@/components/pages/hospital-portal';
import MethodologyPage from '@/components/pages/methodology';

type View = 'home' | 'patients' | 'hospitals' | 'methodology';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('home');
  
  // --- OMNIMED DATA STATE ---
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- THE BACKEND BRIDGE ---
  const handleGenerateReport = async (prompt: string) => {
    if (!uploadedFile) {
      alert("Please upload a scan first!");
      return;
    }

    setIsLoading(true);
    setReport(''); // Clear previous report

    const formData = new FormData();
    formData.append("image", uploadedFile);
    formData.append("prompt", prompt);

    try {
      // Talking to your local FastAPI backend on port 8000
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_OMNIMED_API_KEY || "your-default-secret-key"
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const data = await response.json();
      setReport(data.report); // Update the state with AI findings
      
    } catch (error) {
      console.error("GPU Error:", error);
      setReport("ERROR: Could not connect to the local AI engine. Ensure 'api.py' is running!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1">
        {/* Landing Page */}
        {currentView === 'home' && (
          <LandingPage onNavigate={setCurrentView} />
        )}

        {/* B2C / Patient View */}
        {currentView === 'patients' && (
          <PatientPortal />
        )}

        {/* B2B / Hospital View */}
        {currentView === 'hospitals' && (
          <HospitalPortal />
        )}

        {/* Methodology View */}
        {currentView === 'methodology' && (
          <MethodologyPage />
        )}
      </main>

      <Footer />
    </div>
  );
}