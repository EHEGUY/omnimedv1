'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

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

  const value = useMemo(() => ({ activeScan, setActiveScan }), [activeScan]);

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  return useContext(ScanContext);
}
