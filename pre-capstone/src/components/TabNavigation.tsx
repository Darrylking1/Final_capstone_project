import React from 'react';

interface TabNavigationProps {
  activeTab: 'processing' | 'verification';
  onTabChange: (tab: 'processing' | 'verification') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex justify-center space-x-8">
          <button
            onClick={() => onTabChange('processing')}
            className={`${
              activeTab === 'processing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Image Processing
          </button>
          <button
            onClick={() => onTabChange('verification')}
            className={`${
              activeTab === 'verification'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            User Verification
          </button>
        </nav>
      </div>
    </div>
  );
}