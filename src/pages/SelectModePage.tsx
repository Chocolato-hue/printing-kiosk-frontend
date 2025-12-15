import { Upload, Images, ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const SelectModePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Print Mode</h1>
        <p className="text-gray-500 mb-8">
          Would you like to print one image or combine two images on the same page?
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/upload/single")}
            className="flex items-center justify-center gap-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-medium text-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Upload className="w-6 h-6 text-blue-500" />
            Upload Single Image
          </button>

          <button
            onClick={() => navigate("/upload/multiple")}
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-4 text-lg font-medium shadow-md transition-all duration-200"
          >
            <Images className="w-6 h-6" />
            Upload Two Images
          </button>
        </div>

        {/* ✅ Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 mt-10 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back to Homepage
        </button>

        <p className="text-sm text-gray-400 mt-4">
          You can change this option anytime by going back.
        </p>
      </div>
    </div>
  );
};

export default SelectModePage;
