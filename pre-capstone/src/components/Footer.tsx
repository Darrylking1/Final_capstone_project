import React from 'react';

export function Footer() {
  return (
    <footer className="mt-12 text-center text-sm text-gray-500">
      <p>Powered by Tesseract OCR and Face Recognition</p>
      <p className="mt-1">© {new Date().getFullYear()} Image Processing App. All rights reserved.</p>
    </footer>
  );
}