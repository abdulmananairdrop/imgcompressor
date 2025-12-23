
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { clsx } from 'clsx';

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  className?: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDrop, className }) => {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/avif': [],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px] text-center bg-gray-50/50 hover:bg-gray-100/50 dark:bg-gray-800/30 dark:hover:bg-gray-800/50',
        isDragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700',
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 text-gray-400 mb-4" />
      {isDragActive ? (
        <p className="text-lg text-blue-500 font-medium">Drop the images here ...</p>
      ) : (
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Drag & drop images here, or click to select files
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supports JPEG, PNG, WebP, AVIF (up to 10MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
