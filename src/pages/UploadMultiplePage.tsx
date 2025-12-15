import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UploadMultiplePage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 2) {
      alert("You can only upload up to 2 images.");
      return;
    }

    setImages(files);
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    // 🔒 For now we store locally (safe for kiosk & multi-user)
    localStorage.setItem("uploadedMultipleImages", JSON.stringify([]));

    // TODO: upload to backend / storage
    console.log("Uploading images:", images);

    // 👉 Next step: layout selection
    navigate("/select-layout");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 relative">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">
        Upload Up to 2 Images
      </h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="w-48 h-48 border rounded overflow-hidden"
          >
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
        Continue
      </button>
    </div>
  );
};

export default UploadMultiplePage;
