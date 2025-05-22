import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Loader2 } from 'lucide-react';
import { ProcessingType, ProcessingResult } from '../types';

export default function ProcessingForm() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<ProcessingType>('ocr');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', processingType);

    try {
      const response = await axios.post('http://localhost:5000/process-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Processing Type</label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="ocr"
                checked={processingType === 'ocr'}
                onChange={(e) => setProcessingType(e.target.value as ProcessingType)}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">OCR (Text Extraction)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="facial"
                checked={processingType === 'facial'}
                onChange={(e) => setProcessingType(e.target.value as ProcessingType)}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">Facial Recognition</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              {file && (
                <p className="text-sm text-gray-600">Selected: {file.name}</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing || !file}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </span>
            ) : (
              'Process Image'
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Results</h2>
          {result.success ? (
            <div>
              {processingType === 'ocr' && result.data.text && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {result.data.text}
                  </pre>
                </div>
              )}
              {processingType === 'facial' && result.data.image && (
                <div className="flex justify-center">
                  <img
                    src={`data:image/jpeg;base64,${result.data.image}`}
                    alt="Processed"
                    className="max-w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-600">
              {result.error || 'An error occurred during processing'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}