'use client';

type View = 'home' | 'patients' | 'hospitals';

interface NavbarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onViewChange('home')}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              OmniMed
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {[
              { id: 'home' as View, label: 'Home' },
              { id: 'patients' as View, label: 'For Patients' },
              { id: 'hospitals' as View, label: 'For Hospitals' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  currentView === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
