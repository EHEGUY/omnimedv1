'use client';

import { useState, useRef } from 'react';
import { Upload, Check } from 'lucide-react';

interface ClinicalResult {
  findings: string;
  impression: string;
  nextSteps: string;
  heatmapBase64?: string;
  isMock?: boolean;
}

type Department = 'radiology' | 'neurology' | 'dermatology' | 'oncology';

const departmentGuides: Record<Department, string> = {
  radiology: 'Focus on cardiopulmonary, musculoskeletal, and abdominal findings.',
  neurology: 'Evaluate brain, spine, and peripheral nerve imaging. Note any mass effects.',
  dermatology: 'Assess lesion morphology, size, pigmentation, and surrounding skin.',
  oncology: 'Identify tumor characteristics, size, location, and staging indicators.',
};

const departmentPrompts: Record<Department, string> = {
  radiology: 'You are an expert Radiologist. Analyze this scan carefully.\n\nRespond ONLY in this exact format:\n\nFINDINGS:\n[Your detailed radiological findings]\n\nIMPRESSION:\n[Your clinical impression]\n\nRECOMMENDED NEXT STEPS:\n[Your recommended next steps]',
  neurology: 'You are a Senior Neurologist. Examine this neurological scan.\n\nRespond ONLY in this exact format:\n\nFINDINGS:\n[Your detailed neurological findings]\n\nIMPRESSION:\n[Your clinical impression]\n\nRECOMMENDED NEXT STEPS:\n[Your recommended next steps]',
  dermatology: 'You are a board-certified Dermatologist. Evaluate this skin lesion for asymmetry, border irregularity, color variation, and diameter.\n\nRespond ONLY in this exact format:\n\nFINDINGS:\n[Your detailed dermatological findings]\n\nIMPRESSION:\n[Your clinical impression and malignancy risk]\n\nRECOMMENDED NEXT STEPS:\n[Your recommended next steps]',
  oncology: 'You are an Oncologist. Analyze this scan for tumor characteristics, staging indicators, and metastatic involvement.\n\nRespond ONLY in this exact format:\n\nFINDINGS:\n[Your detailed oncological findings]\n\nIMPRESSION:\n[Your clinical impression]\n\nRECOMMENDED NEXT STEPS:\n[Your recommended next steps]',
};

function parseAiReport(raw: string): { findings: string; impression: string; nextSteps: string } {
  const clean = (raw || '').trim();
  const findingsMatch = clean.match(/FINDINGS:\s*([\s\S]*?)(?=IMPRESSION:|RECOMMENDED NEXT STEPS:|$)/i);
  const impressionMatch = clean.match(/IMPRESSION:\s*([\s\S]*?)(?=RECOMMENDED NEXT STEPS:|$)/i);
  const nextStepsMatch = clean.match(/RECOMMENDED NEXT STEPS:\s*([\s\S]*?)$/i);
  const findings = findingsMatch?.[1]?.trim() || clean;
  const impression = impressionMatch?.[1]?.trim() || '';
  const nextSteps = nextStepsMatch?.[1]?.trim() || '';
  if (!impression && !nextSteps) {
    return { findings: clean, impression: 'See findings above.', nextSteps: 'Consult a specialist for further evaluation.' };
  }
  return { findings, impression, nextSteps };
}

export default function HospitalPortal() {
  const [department, setDepartment] = useState<Department>('radiology');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClinicalResult | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
    if (e.dataTransfer.files) setUploadedFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFiles(Array.from(e.target.files));
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return;
    setIsLoading(true); setResults(null); setErrorMsg(null);
    const apiKey = process.env.NEXT_PUBLIC_OMNIMED_API_KEY || 'your-default-secret-key';
    const file = uploadedFiles[0];

    let dermoHeatmap: string | undefined = undefined;
    if (department === 'dermatology') {
      try {
        const fd = new FormData(); fd.append('image', file);
        const res = await fetch('http://localhost:8000/analyze-dermo', { method: 'POST', headers: { 'x-api-key': apiKey }, body: fd });
        if (res.ok) { const data = await res.json(); dermoHeatmap = data.heatmap; }
      } catch (err) { console.warn('Grad-CAM fetch failed (non-critical):', err); }
    }

    try {
      const fd = new FormData(); fd.append('image', file); fd.append('prompt', departmentPrompts[department]);
      const res = await fetch('http://localhost:8000/analyze', { method: 'POST', headers: { 'x-api-key': apiKey }, body: fd });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      if (data.status === 'error') throw new Error(data.message || 'Inference error');
      const { findings, impression, nextSteps } = parseAiReport(data.report || '');
      setResults({ findings, impression, nextSteps, heatmapBase64: dermoHeatmap, isMock: data.mock === true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Could not connect to the OmniMed backend. Make sure api.py is running on port 8000.\n\nDetails: ${msg}`);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground">Clinical <span className="text-gradient">Dashboard</span></h1>
          <p className="mt-2 text-lg text-muted-foreground">Hospital &amp; Organization Portal — AI-Powered Clinical Analysis</p>
        </div>

        {/* Compliance badges */}
        <div className="mb-8 flex flex-wrap gap-3 animate-fade-in-up delay-100">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">HIPAA Compliant</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">100% Local Processing (Zero Data Leaks)</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column — Controls */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up delay-200">
            <div className="glass-card p-6">
              <label className="block text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Select Department</label>
              <select value={department} onChange={(e) => { setDepartment(e.target.value as Department); setResults(null); setErrorMsg(null); }}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="radiology">Radiology</option>
                <option value="neurology">Neurology</option>
                <option value="dermatology">Dermatology (+ Grad-CAM)</option>
                <option value="oncology">Oncology</option>
              </select>
            </div>

            <div className="glass-card p-6">
              <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Analysis Focus</p>
              <p className="text-sm text-muted-foreground">{departmentGuides[department]}</p>
            </div>

            <div ref={dragRef} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`glass-card flex cursor-pointer flex-col items-center justify-center px-4 py-8 transition-all duration-300 hover:shadow-glow-sm ${isDragActive ? 'border-primary shadow-glow-sm scale-[1.02]' : ''}`}>
              <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-center text-sm font-semibold text-foreground">Drag files here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to select</p>
              {uploadedFiles.length > 0 && <p className="mt-2 text-xs font-semibold text-primary">{uploadedFiles.length} file(s) selected</p>}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="glass-card p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Selected Files</p>
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                      <Check className="h-3 w-3 text-green-400" /><span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAnalyze} disabled={uploadedFiles.length === 0 || isLoading}
              className="w-full rounded-xl bg-gradient-cta px-4 py-3.5 text-sm font-semibold text-white shadow-glow-sm hover:shadow-glow hover:scale-[1.01] disabled:opacity-40 disabled:shadow-none disabled:scale-100 transition-all">
              {isLoading ? 'AI is reasoning…' : 'Run Clinical Analysis'}
            </button>
          </div>

          {/* Right Columns — Results */}
          <div className="lg:col-span-2 animate-fade-in-up delay-300">
            {isLoading && (
              <div className="glass-card p-8 animate-pulse">
                <div className="h-6 w-2/3 bg-muted rounded mb-4" />
                <div className="space-y-4">
                  {[1,2,3].map(i => (<div key={i} className="space-y-2"><div className="h-4 w-1/4 bg-muted rounded" /><div className="h-4 w-full bg-muted rounded" /><div className="h-4 w-5/6 bg-muted rounded" /></div>))}
                </div>
                <p className="mt-6 text-xs text-center text-muted-foreground">OmniMed AI is reasoning over your scan…</p>
              </div>
            )}

            {errorMsg && !isLoading && (
              <div className="glass-card p-6 border-destructive/50">
                <p className="text-sm font-bold text-destructive mb-2">Connection Error</p>
                <p className="text-xs text-destructive/80 whitespace-pre-wrap">{errorMsg}</p>
              </div>
            )}

            {results && !isLoading && (
              <div className="space-y-6">
                {results.isMock && (
                  <div className="glass-card p-4 border-yellow-500/30">
                    <p className="text-xs font-bold text-yellow-400 mb-1">⚠ MOCK MODE — AI Engine Not Loaded</p>
                    <p className="text-xs text-yellow-400/70">The backend is running in mock mode. Run <code className="bg-yellow-500/10 px-1 rounded">.\scripts\run-backend.ps1</code> with CUDA to enable real inference.</p>
                  </div>
                )}

                {results.heatmapBase64 && (
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-bold uppercase text-primary mb-4 flex items-center gap-2"><Check className="h-4 w-4" /> AI Grad-CAM Validation Overlay</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-semibold mb-2">Original Scan</p>
                        <img src={URL.createObjectURL(uploadedFiles[0])} className="w-full rounded-lg object-cover border border-border" alt="Original scan" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-primary font-semibold mb-2">Heatmap (Neural Activation Focus)</p>
                        <img src={results.heatmapBase64} className="w-full rounded-lg object-cover border border-primary/30" alt="AI Heatmap" />
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground leading-relaxed italic">Grad-CAM shows where the neural network focused during classification.</p>
                  </div>
                )}

                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3">Findings</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{results.findings}</p>
                </div>

                {results.impression && (
                  <div className="glass-card p-6 border-primary/30 bg-primary/5">
                    <h3 className="text-sm font-bold uppercase text-primary mb-3">Impression</h3>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{results.impression}</p>
                  </div>
                )}

                {results.nextSteps && (
                  <div className="glass-card p-6 border-green-500/30 bg-green-500/5">
                    <h3 className="text-sm font-bold uppercase text-green-400 mb-3">Recommended Next Steps</h3>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{results.nextSteps}</p>
                  </div>
                )}

                <div className="glass-card p-4 border-yellow-500/30 bg-yellow-500/5">
                  <p className="text-xs font-semibold text-yellow-400 mb-1">CLINICAL DISCLAIMER</p>
                  <p className="text-xs text-muted-foreground">This analysis is AI-assisted and for clinical decision support only. All findings must be verified by qualified healthcare professionals.</p>
                </div>
              </div>
            )}

            {!results && !isLoading && !errorMsg && (
              <div className="glass-card p-12 text-center">
                <p className="text-muted-foreground">Upload a scan and click <strong className="text-foreground">&quot;Run Clinical Analysis&quot;</strong> to see AI-generated clinical output here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
