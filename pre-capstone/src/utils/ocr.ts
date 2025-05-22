import { createWorker, LoggerMessage, Worker } from 'tesseract.js';

interface OCROptions {
  language?: string;
  timeout?: number;
  onProgress?: (progress: number) => void;
}

export class OCRError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'OCRError';
  }
}

export async function performOCR(
  imageFile: File, 
  options: OCROptions = {}
): Promise<string> {
  const { 
    language = 'eng',
    timeout = 30000,
    onProgress 
  } = options;

  // Create worker with logger in the options
  const worker = await createWorker({
    logger: (m: LoggerMessage) => {
      console.log('OCR Progress:', m);
      if (onProgress && m.progress) {
        onProgress(m.progress);
      }
    }
  } as any); // Use type assertion to bypass type checking

  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new OCRError('OCR operation timed out')), timeout);
  });

  try {
    // Validate image file
    if (!imageFile.type.startsWith('image/')) {
      throw new OCRError('Invalid file type. Please provide an image file.');
    }

    // Load language data
    await (worker as any).loadLanguage(language);
    await (worker as any).reinitialize(language);
    
    // Convert File to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new OCRError('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => reject(new OCRError('Failed to read image file'));
      reader.readAsDataURL(imageFile);
    });

    // Race between OCR operation and timeout
    const result = await Promise.race([
      (worker as Worker).recognize(base64Image),
      timeoutPromise
    ]) as { data: { text: string } };
    
    return result.data.text;
  } catch (error) {
    throw new OCRError(
      'OCR processing failed', 
      error
    );
  } finally {
    // Ensure worker is always terminated
    await worker.terminate();
  }
}