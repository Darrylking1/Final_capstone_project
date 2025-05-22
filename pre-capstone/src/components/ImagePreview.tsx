import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  image: string | null;
  onRemove: () => void;
  label: string;
}

export function ImagePreview({ image, onRemove, label }: ImagePreviewProps) {
  if (!image) return null;

  return (
    <div className="relative mt-2">
      <div className="group relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
          alt={label}
          className="h-full w-full object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}