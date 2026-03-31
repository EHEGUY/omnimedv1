'use client';

import { useState, useRef } from 'react';
import { Upload, Check } from 'lucide-react';

interface ClinicalResult {
  findings: string;
  impression: string;
  nextSteps: string;
}

type Department = 'radiology' | 'neurology' | 'dermatology' | 'oncology';

const departmentGuides: Record<Department, string> = {
  radiology: 'Focus on cardiopulmonary, musculoskeletal, and abdominal findings.',
  neurology: 'Evaluate brain, spine, and peripheral nerve imaging. Note any mass effects.',
  dermatology: 'Assess lesion morphology, size, pigmentation, and surrounding skin.',
  oncology: 'Identify tumor characteristics, size, location, and staging indicators.',
};

export default function HospitalPortal() {
  const [department, setDepartment] = useState<Department>('radiology');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClinicalResult | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files) {
      setUploadedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return;

    setIsLoading(true);
    setTimeout(() => {
      const mockResults: Record<Department, ClinicalResult> = {
        radiology: {
          findings:
            'PA chest radiograph demonstrates normal cardiac silhouette with cardiothoracic ratio <0.5. Bilateral lung fields are clear without focal consolidation, pleural effusion, or pneumothorax. Mediastinal contours are unremarkable. Osseous structures intact.',
          impression:
            'No acute cardiopulmonary abnormality. Findings are within normal limits. Clinical correlation recommended.',
          nextSteps:
            'Routine follow-up as clinically indicated. Consider CT chest if further evaluation needed.',
        },
        neurology: {
          findings:
            'Brain MRI FLAIR and T2 sequences demonstrate normal gray and white matter signal intensity without abnormal enhancement. Ventricles and sulci normal in size and configuration. No evidence of acute infarction on DWI. Posterior fossa structures unremarkable.',
          impression:
            'No acute intracranial abnormality. MRI brain is within normal limits. No mass effect or midline shift.',
          nextSteps:
            'Clinical correlation with neurological exam. Consider EEG if seizure suspected. Follow-up MRI as warranted.',
        },
        dermatology: {
          findings:
            'Skin lesion measures approximately 8 mm in greatest dimension. Well-demarcated borders with slight irregularity. Brown to black coloration with relatively homogeneous pigmentation. No surrounding erythema or scaling noted.',
          impression:
            'Benign-appearing pigmented lesion. Lower likelihood of malignancy based on morphology. However, biopsy recommended for definitive diagnosis if clinical concern exists.',
          nextSteps:
            'Dermatology consultation recommended. Photography for baseline. Monitor for changes in size, color, or appearance.',
        },
        oncology: {
          findings:
            'Soft tissue mass measuring 4.2 x 3.8 cm in the left hemithorax. Lesion demonstrates heterogeneous enhancement with central necrosis. No invasion of adjacent structures identified. Hilar lymphadenopathy present.',
          impression:
            'Left pulmonary mass suspicious for malignancy. Hilar lymph node involvement noted. TNM staging assessment recommended.',
          nextSteps:
            'Multidisciplinary tumor board review. PET-CT for metastatic staging. Biopsy for tissue diagnosis if not yet obtained.',
        },
      };

      setResults(mockResults[department]);
      setIsLoading(false);
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Clinical Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Hospital & Organization Portal – Batch Processing with Clinical Analysis
          </p>
        </div>

        {/* Badges */}
        <div className="mb-8 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 border border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">HIPAA Compliant</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 border border-blue-200">
            <Check className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">100% Local Processing (Zero Data Leaks)</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            {/* Department Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Select Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="radiology">Radiology</option>
                <option value="neurology">Neurology</option>
                <option value="dermatology">Dermatology</option>
                <option value="oncology">Oncology</option>
              </select>
            </div>

            {/* Department Guide */}
            <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">ANALYSIS FOCUS</p>
              <p className="text-sm text-blue-800">{departmentGuides[department]}</p>
            </div>

            {/* Batch Upload Zone */}
            <div
              ref={dragRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-center text-sm font-semibold text-gray-700">
                Drag files here
              </p>
              <p className="mt-1 text-xs text-gray-500">or click to select</p>
              {uploadedFiles.length > 0 && (
                <p className="mt-2 text-xs font-semibold text-blue-600">
                  {uploadedFiles.length} file(s) selected
                </p>
              )}
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-600 mb-3">Selected Files</p>
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={uploadedFiles.length === 0 || isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Process Batch'}
            </button>
          </div>

          {/* Right Columns - Results */}
          <div className="lg:col-span-2">
            {isLoading && (
              <div className="rounded-lg bg-gray-50 p-8 animate-pulse">
                <div className="h-6 w-2/3 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
                      <div className="h-4 w-full bg-gray-300 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results && !isLoading && (
              <div className="space-y-6">
                {/* Findings */}
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="text-sm font-bold uppercase text-gray-600 mb-3">Findings</h3>
                  <p className="text-gray-900 leading-relaxed">{results.findings}</p>
                </div>

                {/* Impression */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                  <h3 className="text-sm font-bold uppercase text-blue-900 mb-3">Impression</h3>
                  <p className="text-blue-900 leading-relaxed">{results.impression}</p>
                </div>

                {/* Recommended Next Steps */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                  <h3 className="text-sm font-bold uppercase text-green-900 mb-3">Recommended Next Steps</h3>
                  <p className="text-green-900 leading-relaxed">{results.nextSteps}</p>
                </div>

                {/* Disclaimer */}
                <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">CLINICAL DISCLAIMER</p>
                  <p className="text-xs text-yellow-800">
                    This analysis is AI-assisted and for clinical decision support only. All findings must be verified by qualified healthcare professionals before clinical implementation.
                  </p>
                </div>
              </div>
            )}

            {!results && !isLoading && (
              <div className="rounded-lg bg-gray-50 p-12 text-center">
                <p className="text-gray-600">
                  Upload scans and click "Process Batch" to see structured clinical output here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
