import React, { useState } from 'react';
import { User } from '../types/User';

interface UploadMultiplePageProps {
  user: User | null;
  onBack: () => void;
}

const UploadMultiplePage: React.FC<UploadMultiplePageProps> = ({ user, onBack }) => {
  const [images, setImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      alert('You can only upload up to 2 images.');
      return;
    }
    setImages(files);
  };

  const handleUpload = () => {
    if (images.length === 0) {
      alert('Please select at least one image.');
      return;
    }
    console.log('Uploading:', images);
    // TODO: implement upload logic to backend or storage
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6">Upload 2 Images for Printing</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        {images.map((img, idx) => (
          <div key={idx} className="w-48 h-48 border rounded overflow-hidden">
            <img
              src={URL.createObjectURL(img)}
              alt={`Preview ${idx + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleUpload}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Upload
      </button>

      <button
        onClick={onBack}
        className="mt-4 text-gray-600 underline hover:text-gray-800 transition"
      >
        ← Back
      </button>
    </div>
  );
};

export default UploadMultiplePage;
