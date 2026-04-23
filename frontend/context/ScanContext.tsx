'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface ScanResult {
  scanId: string;
  scanType: string;              // "Dermatology" | "Radiology" | "Neurology" | "Oncology"
  uploadedImageUrl: string;      // base64 or blob URL of the scan
  aiFindings: string;            // the text output from MedGemma analysis
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface ScanContextType {
  activeScan: ScanResult | null;
  setActiveScan: (scan: ScanResult | null) => void;
}

const ScanContext = createContext<ScanContextType>({
  activeScan: null,
  setActiveScan: () => {},
});

export function ScanContextProvider({ children }: { children: ReactNode }) {
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);

  return (
    <ScanContext.Provider value={{ activeScan, setActiveScan }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  return useContext(ScanContext);
}
