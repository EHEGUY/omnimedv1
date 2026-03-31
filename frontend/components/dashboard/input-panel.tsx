'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Stethoscope, Loader2 } from 'lucide-react';

type Department = 'radiology' | 'neurology' | 'dermatology';

interface InputPanelProps {
  selectedDepartment: Department;
  onDepartmentChange: (dept: Department) => void;
  onFileUpload: (file: File) => void;
  // Updated to accept the final prompt string
  onGenerateReport: (prompt: string) => void; 
  uploadedFile: File | null;
  isLoading: boolean;
}

const departmentInstructions: Record<Department, string> = {
  radiology: 'Act as an expert Radiologist. Analyze this X-ray/CT for fractures, masses, or fluid collections. Provide findings and a clinical impression.',
  neurology: 'Act as a Senior Neurologist. Examine this Brain MRI for lesions, structural abnormalities, or signs of demyelinating disease.',
  dermatology: 'Act as a Dermatologist. Evaluate this skin lesion for asymmetry, border irregularity, and color variation. Assess risk of malignancy.',
};

export default function InputPanel({
  selectedDepartment,
  onDepartmentChange,
  onFileUpload,
  onGenerateReport,
  uploadedFile,
  isLoading,
}: InputPanelProps) {
  const [clinicalNotes, setClinicalNotes] = useState(departmentInstructions[selectedDepartment]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync instructions when department changes
  useEffect(() => {
    setClinicalNotes(departmentInstructions[selectedDepartment]);
  }, [selectedDepartment]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <div className="space-y-6">
      {/* 1. Department Selector */}
      <Card className="border-none shadow-sm bg-gray-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Department</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDepartment} onValueChange={(v) => onDepartmentChange(v as Department)}>
            <SelectTrigger className="w-full bg-white border-gray-200 rounded-xl">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radiology">Radiology (X-Rays/CTs)</SelectItem>
              <SelectItem value="neurology">Neurology (Brain MRIs)</SelectItem>
              <SelectItem value="dermatology">Dermatology (Skin Lesions)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 2. Upload Zone */}
      <Card className="border-none shadow-sm bg-gray-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Medical Scan</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all p-8
              ${uploadedFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-white hover:border-blue-400'}`}
          >
            <Upload className={`mb-2 h-8 w-8 ${uploadedFile ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-center text-sm font-medium">
              {uploadedFile ? uploadedFile.name : 'Drop scan or click to browse'}
            </p>
            {uploadedFile && <p className="mt-2 text-xs text-blue-600 font-bold">Scan Ready for Analysis</p>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </CardContent>
      </Card>

      {/* 3. Clinical Instructions (The Prompt) */}
      <Card className="border-none shadow-sm bg-gray-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">AI Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            className="min-h-[100px] bg-white border-gray-200 rounded-xl resize-none focus:ring-blue-500"
          />
        </CardContent>
      </Card>

      {/* 4. Action Button */}
      <Button
        onClick={() => onGenerateReport(clinicalNotes)}
        disabled={!uploadedFile || isLoading}
        size="lg"
        style={{ backgroundColor: '#0066cc' }} // Apple Signature Blue
        className="w-full py-7 rounded-2xl text-lg font-semibold shadow-blue-200 shadow-lg hover:opacity-90 transition-all disabled:bg-gray-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            AI Reasoning...
          </>
        ) : (
          <>
            <Stethoscope className="mr-2 h-5 w-5" />
            Analyze with OmniMed
          </>
        )}
      </Button>
    </div>
  );
}