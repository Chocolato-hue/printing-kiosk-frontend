import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Camera, AlertCircle, Check, X } from 'lucide-react';
import { User } from '../types/User';
import { PrintSize, PrintOrder } from '../types/PrintOrder';
import ImageUpload from '../components/ImageUpload';
import PrintSizeSelector from '../components/PrintSizeSelector';
import PaymentModal from '../components/PaymentModal';
import PrintModal from '../components/PrintModal';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase-config'; // Import the initialized storage instance
import { addDoc, collection, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";  // make sure db is exported from firebase-config.ts
import { getConnectedPrinter } from '../services/PrinterService';

// ...
interface UploadPageProps {
  user: User | null;
  onBack: () => void;
}

const printSizes: PrintSize[] = [
  {
    id: '4x6',
    name: '4x6 Photo',
    dimensions: '4" × 6"',
    price: 0.29,
    minResolution: { width: 1200, height: 1800 }
  },
  {
    id: 'a5',
    name: 'A5 Print',
    dimensions: '5.8" × 8.3"',
    price: 1.99,
    minResolution: { width: 1748, height: 2480 }
  },
  {
    id: 'a4',
    name: 'A4 Print',
    dimensions: '8.3" × 11.7"',
    price: 3.49,
    minResolution: { width: 2480, height: 3508 }
  }
];

const UploadPage: React.FC<UploadPageProps> = ({ user, onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<PrintSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PrintOrder | null>(null);
  const [imageResolution, setImageResolution] = useState<{ width: number; height: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  // Track upload completion
  const [uploadCompleted, setUploadCompleted] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setUploadCompleted(false); // reset
      const fileRef = ref(storage, `printJobs/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          alert("File upload failed. Please try again.");
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedFile(file);
          setImageUrl(url);
          setUploadCompleted(true);
          console.log("✅ Upload completed. Firebase URL:", url);
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const isResolutionSufficient = (size: PrintSize): boolean => {
    if (!imageResolution) return false;
    return imageResolution.width >= size.minResolution.width && 
           imageResolution.height >= size.minResolution.height;
  };

  const handleProceedToPayment = () => {
    if (!uploadedFile || !selectedSize) return;
    if (!uploadCompleted) {
      alert("Please wait until the upload is complete.");
      return;
    }
    if (!imageUrl) {
      alert("Error: Image URL not ready. Cannot proceed.");
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    if (!uploadedFile || !selectedSize || !user) return;

    try {
      // 🔹 Get printer ID (from Dell backend or env)
      const printerId = await getConnectedPrinter();
      console.log("🖨️ Using printer ID:", printerId);

      // 🔹 Verify printer exists in Firestore
      const printerRef = doc(db, "printers", printerId);
      const printerSnap = await getDoc(printerRef);

      if (!printerSnap.exists()) {
        alert(`Printer ${printerId} is not registered in Firestore!`);
        return;
      }

      // 🔹 Add print job to Firestore
      const jobRef = await addDoc(collection(db, "printJobs"), {
        userId: user.uid,
        fileName: uploadedFile.name,
        imageUrl,
        printSize: selectedSize.id,
        quantity,
        totalPrice,
        printerId, // ✅ now guaranteed to exist
        status: "pending",
        createdAt: serverTimestamp(),
      });

      console.log("✅ Job created in Firestore:", jobRef.id);

      // (your existing cleanup or success logic here, e.g. reset states, show message)
      alert("✅ Your print job was successfully created!");

    } catch (err) {
      console.error("❌ Error creating print job:", err);
      alert("Could not create print job. Please try again.");
    }
  };

  const handlePrintComplete = () => {
    setShowPrint(false);
    setCompletedOrder(null);
    // Reset form after printing
    setUploadedFile(null);
    setImageUrl('');
    setSelectedSize(null);
    setQuantity(1);
    setImageResolution(null);
  };

  const totalPrice = selectedSize ? selectedSize.price * quantity : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-2">
                <Camera className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">PrintPro</span>
              </div>
            </div>
            <div className="text-gray-700">
              Welcome, {user?.name}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photo</h1>
          <p className="text-gray-600">Choose your image and print size to get started</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <ImageUpload 
              onFileUpload={handleFileUpload}
              uploadedFile={uploadedFile}
              imageUrl={imageUrl}
              onRemoveFile={() => {
                setUploadedFile(null);
                setImageUrl('');
                setImageResolution(null);
              }}
              onImageLoad={setImageResolution}
            />

            {imageResolution && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">Image Details</h3>
                <p className="text-gray-600">
                  Resolution: {imageResolution.width} × {imageResolution.height} pixels
                </p>
                <p className="text-gray-600">
                  File size: {uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                </p>
              </div>
            )}
          </div>

          {/* Print Options */}
          <div className="space-y-6">
            <PrintSizeSelector
              sizes={printSizes}
              selectedSize={selectedSize}
              onSizeSelect={setSelectedSize}
              isResolutionSufficient={isResolutionSufficient}
              imageResolution={imageResolution}
            />

            {selectedSize && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Order Summary */}
            {uploadedFile && selectedSize && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{selectedSize.name}</span>
                    <span className="font-medium">${selectedSize.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-xl text-blue-600">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleProceedToPayment}
                  disabled={!uploadCompleted} // ✅ disable until upload finishes
                  //disabled={!isResolutionSufficient(selectedSize)} = can print despite low resolution
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Payment
                </button>

                {!isResolutionSufficient(selectedSize) && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-medium">Resolution too low</p>
                      <p className="text-red-600 text-sm">
                        This image resolution is too low for quality {selectedSize.name} printing. 
                        Please upload a higher resolution image.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedSize && uploadedFile && (
        <PaymentModal
          order={{
            id: Math.random().toString(36).substr(2, 9),
            imageFile: uploadedFile,
            imageUrl,
            printSize: selectedSize,
            quantity,
            totalPrice
          }}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Print Modal */}
      {showPrint && completedOrder && (
        <PrintModal
          order={completedOrder}
          onClose={handlePrintComplete}
        />
      )}
    </div>
  );
};

export default UploadPage;