import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { VerificationData } from '../types';

interface VerificationStatusProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  verificationData: VerificationData | null;
}

export function VerificationStatus({ status, verificationData }: VerificationStatusProps) {
  if (status === 'idle' || status === 'processing' || !verificationData) return null;

  // Determine verification status based on confidence level
  // Change this line to adjust the threshold
  const confidenceThreshold = 50; // Lowered from 60 to 50 to make verification easier to pass
  const isVerified = verificationData.confidence * 100 >= confidenceThreshold;
  const finalStatus = isVerified ? 'success' : 'error';

  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'Verification Successful'
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      message: 'Verification Failed'
    }
  }[finalStatus];

  if (!statusConfig) return null;

  const Icon = statusConfig.icon;

  // Separate details into OCR and facial recognition categories
  const ocrDetails = verificationData.ocrDetails || [];
  const facialDetails = verificationData.facialDetails || [];
  const generalDetails = verificationData.details?.filter(
    (detail) => !ocrDetails.includes(detail) && !facialDetails.includes(detail)
  ) || [];

  return (
    <div className={`p-4 border ${statusConfig.borderColor} ${statusConfig.bgColor} rounded-md`}>
      <div className="flex items-center">
        <Icon className={`w-6 h-6 ${statusConfig.color} mr-2`} />
        <span className={statusConfig.color}>{statusConfig.message}</span>
      </div>

      {/* OCR Verification Section */}
      {ocrDetails.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold">ID Data Verification</h4>
          <ul className="list-disc pl-5">
            {ocrDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Facial Recognition Section */}
      {facialDetails.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold">Facial Recognition</h4>
          <ul className="list-disc pl-5">
            {facialDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* General Details Section */}
      {generalDetails.length > 0 && (
        <div className="mt-2">
          <ul className="list-disc pl-5">
            {generalDetails.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence Score */}
      {verificationData.confidence !== undefined && (
        <div className="mt-2 font-semibold">
          Overall Confidence Score: {(verificationData.confidence * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
