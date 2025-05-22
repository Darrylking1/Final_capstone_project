import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4 mr-1" />
      <span>{message}</span>
    </div>
  );
}