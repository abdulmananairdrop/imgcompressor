import React, { useState, useEffect, useMemo } from 'react';
import { Download, X, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useImageCompression } from '../hooks/useImageCompression';
import { formatBytes } from '../utils/imageUtils';

interface ImageCardProps {
  file: File;
  onRemove: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ file, onRemove }) => {
  const [quality, setQuality] = useState(75);
  const [scale, setScale] = useState(1);
  const [showOriginal, setShowOriginal] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const compressionOptions = useMemo(() => ({
    quality,
    width: dimensions ? Math.round(dimensions.width * scale) : undefined,
    height: dimensions ? Math.round(dimensions.height * scale) : undefined
  }), [quality, scale, dimensions]);

  const { compressedBlob, isCompressing, error } = useImageCompression(file, compressionOptions);

  const compressedUrl = useMemo(() => {
    if (compressedBlob) return URL.createObjectURL(compressedBlob);
    return null;
  }, [compressedBlob]);

  useEffect(() => {
    return () => {
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [compressedUrl]);

  const reduction = useMemo(() => {
    if (!compressedBlob) return 0;
    return ((file.size - compressedBlob.size) / file.size) * 100;
  }, [file.size, compressedBlob]);

  const handleDownload = () => {
    if (compressedBlob && compressedUrl) {
      const a = document.createElement('a');
      a.href = compressedUrl;
      a.download = `compressed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row">
      {/* Preview Section */}
      <div className="relative w-full md:w-64 h-64 md:h-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="relative w-full h-full flex items-center justify-center">
            {originalUrl ? (
                <img 
                    src={showOriginal ? originalUrl : (compressedUrl || originalUrl)} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain rounded-md"
                />
            ) : (
                <Loader2 className="animate-spin text-gray-400" />
            )}
            
            <button
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onMouseLeave={() => setShowOriginal(false)}
                className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm hover:bg-black/70 transition-colors"
                title="Hold to view original"
            >
                {showOriginal ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div className="overflow-hidden">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] md:max-w-xs" title={file.name}>
                        {file.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatBytes(file.size)} &bull; {file.type.split('/')[1].toUpperCase()}
                        {dimensions && ` &bull; ${dimensions.width}x${dimensions.height}`}
                    </p>
                </div>
                <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {error ? (
                 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Compression failed. Try a different format or size.
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span>Quality</span>
                            <span>{quality}%</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex gap-2 pt-1">
                            {[25, 50, 75].map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => setQuality(preset)}
                                    className={clsx(
                                        "px-2 py-1 text-xs rounded border transition-colors",
                                        quality === preset
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                                    )}
                                >
                                    {preset}%
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span>Resize</span>
                            <span>{Math.round(scale * 100)}%</span>
                        </label>
                         <select 
                            value={scale} 
                            onChange={(e) => setScale(Number(e.target.value))}
                            className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value={1}>Original (100%)</option>
                            <option value={0.75}>75%</option>
                            <option value={0.5}>50%</option>
                            <option value={0.25}>25%</option>
                        </select>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Stats & Actions */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="space-y-1">
                {isCompressing ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Compressing...</span>
                    </div>
                ) : compressedBlob ? (
                    <>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatBytes(compressedBlob.size)}
                            </span>
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                                -{reduction.toFixed(0)}%
                            </span>
                        </div>
                         {dimensions && (
                            <div className="text-xs text-gray-400">
                                Output: {Math.round(dimensions.width * scale)}x{Math.round(dimensions.height * scale)}
                            </div>
                        )}
                    </>
                ) : (
                    <span className="text-sm text-gray-400">Waiting...</span>
                )}
            </div>

            <button
                onClick={handleDownload}
                disabled={!compressedBlob || isCompressing}
                className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                    compressedBlob && !isCompressing
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                )}
            >
                <Download className="w-4 h-4" />
                <span>Download</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;