import React, { useState, useEffect } from 'react';
import VerificationForm from './components/VerificationForm';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CheckCircle2, LogOut, Hand } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './contexts/ThemeContext';

interface RequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string; // Optional: To personalize the welcome message
  onLogout: () => void; // Assuming logout logic is handled outside
}

function RequirementsModal({ isOpen, onClose, userName = 'User', onLogout }: RequirementsModalProps) {
  const { isDarkMode } = useTheme();
  
  if (!isOpen) return null;

  return (
    // Modal Overlay - Full screen
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto transition-colors duration-200">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-normal flex items-center gap-2 dark:text-white">
            Welcome {userName} <Hand className="text-amber-600 inline-block" />
          </h1>
          <p className="text-xl font-light dark:text-gray-300">Let's get you started!</p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg font-light">
          First fill out your profile details. We'll use this information to verify your identity and create your account on our platform.
        </p>

        <p className="font-normal mb-6 text-xl dark:text-white">You'll need the following:</p>

        <div className="space-y-8">
          {/* Passport Photo Requirements */}
          <div className="flex gap-4">
            <CheckCircle2 className="text-emerald-500 h-7 w-7 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-normal text-xl dark:text-white">Clear Passport Sized Photo</h3>
              <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside font-light">
                <li>White background</li>
                <li>JPEG or PNG format</li>
                <li>Full face and shoulders visible</li>
                <li>No hats sunglasses or earphones</li>
                <li>No blur</li>
              </ul>
            </div>
          </div>

          {/* Valid ID Requirements */}
          <div className="flex gap-4">
            <CheckCircle2 className="text-emerald-500 h-7 w-7 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-normal text-xl dark:text-white">Photo of Valid ID</h3>
              <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside font-light">
                <li>Government-issued ID (National ID, Driver's License, Passport)</li>
                <li>Clear photos of both sides of the ID (not blurry)</li>
                <li>All information must be clearly visible</li>
              </ul>
            </div>
          </div>

          {/* Address Information */}
          <div className="flex gap-4">
            <CheckCircle2 className="text-emerald-500 h-7 w-7 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-normal text-xl dark:text-white">Address Information</h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400 font-light">
                Your current residential address and contact information
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-4 max-w-md mx-auto">
          <button
            onClick={onClose} // Close modal on click
            className="w-full bg-teal-500 text-white py-4 rounded-lg font-normal hover:bg-teal-600 transition-colors text-lg"
          >
            Get Started
          </button>

          <button
            onClick={onLogout} // Trigger logout function
            className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 py-4 rounded-lg font-normal flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-lg"
          >
            Logout <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [modalOpen, setModalOpen] = useState(true);
  const userName = 'Darryl'; // This could be fetched from an auth context or API
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Simulate loading the verification form route
  useEffect(() => {
    // Show the modal when the component mounts (verification form route loads)
    setModalOpen(true);
  }, []);

  const handleLogout = () => {
    // Implement logout functionality here
    console.log('User logged out');
    // Redirect to login page or perform other logout actions
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Fixed position theme toggle in the top-right corner */}
      <div className="fixed top-4 right-4 z-[100]">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Header />
        
        <main>
          {/* Requirements Modal */}
          <RequirementsModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)}
            userName={userName}
            onLogout={handleLogout}
          />
          
          {/* Only show the form when the modal is closed */}
          <div className={modalOpen ? 'hidden' : 'block'}>
            <VerificationForm />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;