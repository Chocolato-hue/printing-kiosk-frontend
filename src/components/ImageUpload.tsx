import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';

interface ImageUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  imageUrl: string;
  onRemoveFile: () => void;
  onImageLoad?: (resolution: { width: number; height: number }) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileUpload, uploadedFile, imageUrl, onRemoveFile, onImageLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);


  const MAX_FILE_SIZE_MB = 10;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      return;
    }

    if (file.type.startsWith('image/')) {
      setErrorMessage(null); // clear any previous error
      onFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      return;
    }

    if (file.type.startsWith('image/')) {
      setErrorMessage(null);
      onFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemoveFile?.();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="font-semibold text-gray-900 mb-4">Select Image</h3>
      
      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">Drop your image here</p>
              <p className="text-gray-600">or click to browse</p>
            </div>
            <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF (Max 10MB)</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {/* ❗ Add error message here */}
          {errorMessage && (
            <p className="mt-2 text-red-600 text-sm">{errorMessage}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="w-full h-64 object-cover rounded-lg"
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                onImageLoad?.({ width: img.naturalWidth, height: img.naturalHeight });
                console.log("🖼️ Image loaded. Resolution:", img.naturalWidth, "x", img.naturalHeight);
              }}
              onError={() => setErrorMessage("Failed to load image preview.")}
            />
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-emerald-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">Image uploaded successfully</span>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>File: {uploadedFile.name}</p>
            <p>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;