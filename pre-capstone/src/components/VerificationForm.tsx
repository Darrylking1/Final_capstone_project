import React, { useState } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { simulateVerification } from '../utils/verification';
import { useFormValidation } from '../hooks/useFormValidation';
import { ErrorMessage } from './ErrorMessage';
import { IFormData, REGIONS, ID_TYPES, VerificationData } from '../types';
import { CameraCapture } from './CameraCapture';
import { PhotoUploadModal } from './PhotoUploadModal';
import { ImagePreview } from './ImagePreview';
import { VerificationStatus } from './VerificationStatus';

export default function VerificationForm() {
  const [formData, setFormData] = useState<IFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    landmark: '',
    ghanaPostAddress: '',
    region: '',
    city: '',
    area: '',
    idType: '',
    idNumber: '',
    idCardFile: null,
    idExpiry: '',
    selfieFile: null
  });

  const [showUploadModal, setShowUploadModal] = useState<'id' | 'selfie' | null>(null);
  const [showCamera, setShowCamera] = useState<'id' | 'selfie' | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [verificationData, setVerificationData] = useState<VerificationData | undefined>();
  const { errors, validateForm } = useFormValidation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (file: File) => {
    if (showUploadModal === 'id') {
      setFormData(prev => ({ ...prev, idCardFile: file }));
    } else if (showUploadModal === 'selfie') {
      setFormData(prev => ({ ...prev, selfieFile: file }));
    }
    setShowUploadModal(null);
  };

  const handleCameraCapture = (file: File) => {
    if (showCamera === 'id') {
      setFormData(prev => ({ ...prev, idCardFile: file }));
    } else if (showCamera === 'selfie') {
      setFormData(prev => ({ ...prev, selfieFile: file }));
    }
    setShowCamera(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      setStatus('error');
      return;
    }

    setStatus('processing');
    try {
      // Track submission count in localStorage
      const currentCount = parseInt(localStorage.getItem('submissionCount') || '0');
      localStorage.setItem('submissionCount', (currentCount + 1).toString());
      
      // Alternate between success and failure based on even/odd count
      const isEvenSubmission = currentCount % 2 === 0;
      
      if (isEvenSubmission) {
        // Even submissions (including 0): Show successful verification
        setVerificationData({
          success: true,
          message: 'Verification successful',
          confidence: 0.92,
          ocrDetails: [
            'ID card data successfully extracted',
            'First Name: DARRYL (Match: 100% confidence)',
            'Last Name: KING (Match: 100% confidence)',
            'ID Number: GHA-719879658-0 (Match: 100% confidence)',
            'Nationality: GHANAIAN (Match: 100% confidence)',
            'Sex: MALE (Match: 100% confidence)'
          ],
          facialDetails: [
            'Facial verification successful',
            'Face match confidence: 95%',
            'Liveness check passed',
            'Facial features match with high confidence'
          ],
          details: ['All verification checks passed'],
          extractedData: {
            firstName: 'DARRYL',
            lastName: 'KING',
            idNumber: 'GHA-719879658-0',
            nationality: 'GHANAIAN',
            sex: 'MALE'
          }
        });
        setStatus('success');
      } else {
        // Odd submissions: Show failed verification
        setVerificationData({
          success: false,
          message: 'Verification failed - Information mismatch detected',
          confidence: 0.38,
          ocrDetails: [
            'ID card data extraction successful',
            'First Name: DARRYL (Match: 100% confidence)',
            'Last Name: JOHN (Mismatch: Expected KING, 0% confidence)',
            'ID Number: GHA-719879658-0 (Match: 100% confidence)',
            'Nationality: GHANAIAN (Match: 100% confidence)',
            'Sex: FEMALE (Mismatch: Expected MALE, 0% confidence)'
          ],
          facialDetails: [
            'Facial verification failed',
            'Face match confidence: 32%',
            'Liveness check passed but facial features do not match',
            'Please ensure the selfie matches the ID card photo'
          ],
          details: [
            'Verification failed due to critical mismatches',
            'Last name on ID does not match submitted information',
            'Gender/sex on ID does not match submitted information',
            'Facial recognition score below acceptable threshold'
          ],
          extractedData: {
            firstName: 'DARRYL',
            lastName: 'JOHN',
            idNumber: 'GHA-719879658-0',
            nationality: 'GHANAIAN',
            sex: 'FEMALE'
          }
        });
        setStatus('error');
      }
      
      // Comment out the actual API call for now
      // const result = await simulateVerification(formData);
      // setVerificationData(result);
      // setStatus(result.success ? 'success' : 'error');
    } catch (error) {
      setStatus('error');
      setVerificationData({
        success: false,
        message: 'Verification process encountered an error',
        confidence: 0.0,
        ocrDetails: [
          'Document verification failed',
          'Unable to extract data from ID card',
          'Please ensure ID card photo is clear and properly framed',
          'Try again with better lighting conditions'
        ],
        facialDetails: [
          'Facial verification failed',
          'Face match confidence: 0%',
          'Unable to detect a clear face in the provided image',
          'Please ensure proper lighting and that face is clearly visible'
        ],
        details: ['An unexpected error occurred during verification process']
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto rounded-xl bg-white p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter firstname"
              required
            />
            {errors.firstName && <ErrorMessage message={errors.firstName} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter lastname"
              required
            />
            {errors.lastName && <ErrorMessage message={errors.lastName} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
            {errors.dateOfBirth && <ErrorMessage message={errors.dateOfBirth} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <div className="mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                  className="form-radio text-green-600"
                />
                <span className="ml-2">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                  className="form-radio text-green-600"
                />
                <span className="ml-2">Female</span>
              </label>
            </div>
            {errors.gender && <ErrorMessage message={errors.gender} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter Phone Number"
              required
            />
            {errors.phoneNumber && <ErrorMessage message={errors.phoneNumber} />}
          </div>

          {/* Address Information */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Residential Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter Residential Address"
              required
            />
            {errors.address && <ErrorMessage message={errors.address} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nearest Landmark</label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter your nearest landmark"
              required
            />
            {errors.landmark && <ErrorMessage message={errors.landmark} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ghana Post Address</label>
            <input
              type="text"
              name="ghanaPostAddress"
              value={formData.ghanaPostAddress}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter Ghana Post Address"
              required
            />
            {errors.ghanaPostAddress && <ErrorMessage message={errors.ghanaPostAddress} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Region</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            >
              <option value="">Select Region</option>
              {REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            {errors.region && <ErrorMessage message={errors.region} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter the name of your City"
              required
            />
            {errors.city && <ErrorMessage message={errors.city} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Area/Location</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter the name of your Area/Location"
              required
            />
            {errors.area && <ErrorMessage message={errors.area} />}
          </div>

          {/* ID Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Type</label>
            <select
              name="idType"
              value={formData.idType}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            >
              <option value="">Select ID Type</option>
              {ID_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.idType && <ErrorMessage message={errors.idType} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ID Number</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter ID Number"
              required
            />
            {errors.idNumber && <ErrorMessage message={errors.idNumber} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ID Expiry Date</label>
            <input
              type="date"
              name="idExpiry"
              value={formData.idExpiry}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
            {errors.idExpiry && <ErrorMessage message={errors.idExpiry} />}
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Card Photo</label>
            {formData.idCardFile ? (
              <ImagePreview
                image={formData.idCardFile ? URL.createObjectURL(formData.idCardFile) : ''}
                onRemove={() => setFormData(prev => ({ ...prev, idCardFile: null }))}
                label="ID Card Photo"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowUploadModal('id')}
                className="mt-1 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-green-500"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-green-600">Upload ID Card</span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Selfie Photo</label>
            {formData.selfieFile ? (
              <ImagePreview
                image={formData.selfieFile ? URL.createObjectURL(formData.selfieFile) : ''}
                onRemove={() => setFormData(prev => ({ ...prev, selfieFile: null }))}
                label="Selfie Photo"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowUploadModal('selfie')}
                className="mt-1 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-green-500"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="mt-2 text-sm font-medium text-green-600">Upload Selfie</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === 'processing'}
            className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {status === 'processing' ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 -ml-1 mr-2 animate-spin" />
                Processing...
              </span>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>

        <VerificationStatus status={status} verificationData={verificationData || null} />
      </form>

      {showUploadModal && (
        <PhotoUploadModal
          title={`Upload ${showUploadModal === 'id' ? 'ID Card' : 'Selfie'}`}
          onClose={() => setShowUploadModal(null)}
          onUpload={handleFileUpload}
          onTakePhoto={() => {
            setShowCamera(showUploadModal);
            setShowUploadModal(null);
          }}
        />
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(null)}
        />
      )}
    </div>
  );
}