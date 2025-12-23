import { useState, useEffect, useRef } from 'react';
import { compressImage } from '../utils/compression';
import type { CompressionOptions } from '../utils/compression';

export const useImageCompression = (file: File, options: CompressionOptions) => {
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce ref
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const compress = async () => {
      setIsCompressing(true);
      setError(null);
      try {
        const result = await compressImage(file, options);
        setCompressedBlob(result);
      } catch (err) {
        console.error(err);
        setError('Compression failed');
      } finally {
        setIsCompressing(false);
      }
    };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      compress();
    }, 500) as unknown as number; // 500ms debounce

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [file, options.quality, options.width, options.height]);

  return { compressedBlob, isCompressing, error };
};