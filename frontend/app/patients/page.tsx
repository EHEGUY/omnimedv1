import PatientPortal from '@/components/pages/patient-portal';

export const metadata = {
  title: 'Patient Portal — OmniMed AI',
  description: 'Upload your scan and chat instantly with your private AI second opinion. Secure, local, and instant.',
};

export default function PatientsPage() {
  return <PatientPortal />;
}
