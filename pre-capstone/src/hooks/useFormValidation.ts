import { useState, useCallback } from 'react';
import { IFormData } from '../types';

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = useCallback((data: IFormData): boolean => {
    const newErrors: ValidationErrors = {};

    // Validation logic remains the same
    // ...

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  return { errors, validateForm };
}