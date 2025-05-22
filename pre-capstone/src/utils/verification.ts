import axios from 'axios';
import { IFormData, VerificationData } from '../types';

const processImage = async (file: File, type: 'ocr' | 'facial') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);

  try {
    const response = await axios.post('http://localhost:5000/process-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Image processing failed');
  }
};

export const verifyDocuments = async (idCardFile: File, selfieFile: File, formData: IFormData): Promise<{
  ocrResult: any;
  faceResult: any;
  dataVerification: any;
}> => {
  // Process images
  const [ocrResult, faceResult] = await Promise.all([
    processImage(idCardFile, 'ocr'),
    processImage(selfieFile, 'facial')
  ]);
  
  // If OCR was successful, verify the extracted data against form data
  let dataVerification = null;
  if (ocrResult.success && ocrResult.data.extracted) {
    try {
      const verifyResponse = await axios.post('http://localhost:5000/verify-id-data', {
        formData,
        ocrData: ocrResult.data.extracted
      });
      dataVerification = verifyResponse.data;
    } catch (error) {
      console.error('Data verification failed:', error);
    }
  }

  return { ocrResult, faceResult, dataVerification };
};

export const simulateVerification = async (data: IFormData): Promise<VerificationData> => {
  try {
    if (!data.idCardFile || !data.selfieFile) {
      throw new Error('Both ID card and selfie are required');
    }

    const { ocrResult, faceResult, dataVerification } = await verifyDocuments(
      data.idCardFile, 
      data.selfieFile,
      data
    );
    
    if (!ocrResult.success || !faceResult.success) {
      return {
        success: false,
        message: "Verification failed",
        details: [
          "Document verification failed",
          "Please ensure both photos are clear and try again"
        ]
      };
    }

    // Simulate face matching confidence
    const faceMatchScore = Math.random();
    
    // Check data verification results
    const dataMatchFailed = dataVerification && 
                           !dataVerification.success || 
                           (dataVerification.data && !dataVerification.data.overall_match);
    
    // Prepare separate details for OCR and facial verification
    const ocrDetails: string[] = [];
    const facialDetails: string[] = [];
    
    // Add facial recognition details
    facialDetails.push(`Face matching confidence: ${(faceMatchScore * 100).toFixed(1)}%`);
    
    if (faceMatchScore < 0.7) {
      facialDetails.push("Face matching below threshold");
      facialDetails.push("Please try again with a clearer selfie photo");
    } else {
      facialDetails.push("Face successfully matched");
    }
    
    // Add OCR verification details
    if (dataVerification?.data) {
      if (dataVerification.data.overall_match) {
        ocrDetails.push("ID card data matches form data");
      } else {
        ocrDetails.push("ID card data doesn't match form data");
      }
      
      // Add details about matches
      if (dataVerification.data.matches && dataVerification.data.matches.length > 0) {
        dataVerification.data.matches.forEach((match: any) => {
          ocrDetails.push(`${match.field}: "${match.form_value}" verified`);
        });
      }
      
      // Add details about mismatches
      if (dataVerification.data.mismatches && dataVerification.data.mismatches.length > 0) {
        dataVerification.data.mismatches.forEach((mismatch: any) => {
          ocrDetails.push(`${mismatch.field}: Form has "${mismatch.form_value}" but ID shows "${mismatch.ocr_value}"`);
        });
      }
    }
    
    // Determine overall success
    const overallSuccess = faceMatchScore >= 0.7 && !dataMatchFailed;
    
    return {
      success: overallSuccess,
      message: overallSuccess ? "Verification successful" : "Verification failed",
      details: ["Verification process completed"],
      ocrDetails,
      facialDetails,
      confidence: (faceMatchScore + (dataVerification?.data?.confidence || 0)) / 2 // Average of both scores
    };
  } catch (error) {
    return {
      success: false,
      message: "Verification failed",
      details: [
        "Error processing documents",
        "Please ensure all images are clear and try again",
        error instanceof Error ? error.message : "Unknown error occurred"
      ]
    };
  }
};