import React from 'react';
import { UserCheck } from 'lucide-react';

export function Header() {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <UserCheck className="h-12 w-12 text-green-600 dark:text-green-500" />
      </div>
      <h1 className="text-4xl font-light text-gray-800 dark:text-gray-200 mb-2 transition-colors">
        Subscriber Verification
      </h1>
      <p className="text-lg font-light text-gray-600 dark:text-gray-400 transition-colors">
        Complete verification process with ID and selfie
      </p>
    </div>
  );
}