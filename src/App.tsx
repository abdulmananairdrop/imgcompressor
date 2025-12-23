import { useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import Dropzone from './components/Dropzone';
import ImageCard from './components/ImageCard';

function App() {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = (acceptedFiles: File[]) => {
    // Append new files, avoiding duplicates if possible (by name+size? simple check)
    setFiles((prev) => {
      const newFiles = acceptedFiles.filter(
        (newFile) => !prev.some((f) => f.name === newFile.name && f.size === newFile.size)
      );
      return [...prev, ...newFiles];
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h1 className="font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white font-[Inter,sans-serif]">
              Pablo's <span className="text-blue-600">Compressor</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <section className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <a 
              href="https://becxus.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-blue-600 transition-colors bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Compressor for becxus.com
            </a>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            High-quality, private image compression directly in your browser. 
            No server uploads. Fast, local, and secure.
          </p>
        </section>

        <section className="max-w-3xl mx-auto">
          <Dropzone onDrop={handleDrop} />
        </section>

        {files.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-2">
              <ImageIcon className="w-5 h-5" />
              <span className="font-medium">{files.length} Images</span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {files.map((file, index) => (
                <ImageCard 
                    key={`${file.name}-${index}`} 
                    file={file} 
                    onRemove={() => removeFile(index)} 
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20 bg-white dark:bg-gray-900 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} PureCompress. Open Source & Client-Side.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;