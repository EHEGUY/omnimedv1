'use client';

import { useState, useRef } from 'react';
import { Upload, ArrowRight, Loader2 } from 'lucide-react'; // Added Loader2
import SpecialistModal from '@/components/specialist-modal';

interface PatientResult {
  diagnosis: string;
  explanation: string;
}

export default function PatientPortal() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PatientResult | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) setUploadedFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
  };

  // --- THE REAL API CONNECTION ---
  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", uploadedFile);
    
    // Combine the instructions with the user's specific symptoms
    const fullPrompt = `Act as a helpful medical AI. The patient reports these symptoms: "${symptoms || 'None reported'}". Analyze this scan and provide a clear, patient-friendly explanation of the findings.`;
    formData.append("prompt", fullPrompt);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend not responding");

      const data = await response.json();

      setResult({
        diagnosis: 'AI Preliminary Analysis Complete',
        explanation: data.report, // This is the text from MedGemma!
      });
    } catch (error) {
      console.error("Connection Error:", error);
      setResult({
        diagnosis: 'Connection Error',
        explanation: "Could not connect to the local OmniMed Engine. Please ensure your Python server (api.py) is running on port 8000.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white">
      <SpecialistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">OmniMed <span className="text-blue-600">Patient Care</span></h1>
          <p className="mt-4 text-lg text-gray-500">
            Upload your scan for an instant, private AI second opinion.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <div
              ref={dragRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-400'
              } ${uploadedFile ? 'border-blue-600 bg-blue-50/30' : ''}`}
            >
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
              <Upload className={`h-10 w-10 mb-4 ${uploadedFile ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="text-center font-bold text-gray-900">
                {uploadedFile ? uploadedFile.name : 'Choose Scan File'}
              </p>
              <p className="mt-1 text-sm text-gray-500">X-Ray, MRI, or CT (JPG/PNG)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                What are you feeling?
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe any pain or symptoms..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                rows={4}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!uploadedFile || isLoading}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-200 transition-all flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Reasoning...</>
              ) : (
                'Generate AI Opinion'
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-2xl bg-blue-50 p-8 border border-blue-100 shadow-sm mb-6">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">AI Findings</h3>
                  <p className="text-xl font-bold text-gray-900 mb-4">{result.diagnosis}</p>
                  <p className="text-gray-700 leading-relaxed text-md">{result.explanation}</p>
                  
                  <div className="mt-6 rounded-lg bg-white/50 p-4 border border-blue-200 text-xs text-blue-800 italic">
                    Note: This is an AI-generated assessment based on clinical patterns. It does not replace professional medical judgment.
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-8 bg-white shadow-xl shadow-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Speak with a Human</h3>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Our AI has flagged potential areas of interest. Would you like a board-certified specialist to review this scan within the next 24 hours?
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-white font-bold hover:bg-black transition-all"
                  >
                    Contact Specialist <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/50 p-12 text-center text-gray-400">
                <p className="text-sm font-medium">Your analysis will appear here once the scan is processed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}