import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Camera, AlertCircle, Check, X } from 'lucide-react';
import { User } from '../types/User';
import { PrintSize, PrintOrder } from '../types/PrintOrder';
import ImageUpload from '../components/ImageUpload';
import PrintSizeSelector from '../components/PrintSizeSelector';
import PaymentModal from '../components/PaymentModal';
import PrintModal from '../components/PrintModal';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject} from 'firebase/storage';
import { storage } from '../firebase-config'; // Import the initialized storage instance
import { addDoc, collection, serverTimestamp, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";  // make sure db is exported from firebase-config.ts
import { submitPrintJob, getConnectedPrinter, fetchAvailablePrinters } from '../services/PrinterService';

// ...
interface UploadPageProps {
  user: User | null;
  onBack: () => void;
}

// ✅ Force frontend to only allow A5 prints
const printSizes: PrintSize[] = [
  {
    id: 'a5',
    name: 'A5 Print',
    dimensions: '5.8" × 8.3"',
    price: 1.99,
    minResolution: { width: 1160, height: 1654 }
  }
];

const UploadPage: React.FC<UploadPageProps> = ({ user, onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<PrintSize | null>({
    id: 'a5',
    name: 'A5 Print',
    dimensions: '5.8" × 8.3"',
    price: 1.99,
    minResolution: { width: 1160, height: 1654 }
  });
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PrintOrder | null>(null);
  const [imageResolution, setImageResolution] = useState<{ width: number; height: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  // 🔽 Printer selection states
  const [printers, setPrinters] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");

  // Track upload completion
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [compressionNotice, setCompressionNotice] = useState<string>('');

  // 🖨️ Load available printers from Firestore
  useEffect(() => {
    async function loadPrinters() {
      const printerList = await fetchAvailablePrinters();
      setPrinters(printerList);

      // Restore previously selected printer (if user picked one before)
      const saved = localStorage.getItem("selectedPrinter");
      if (saved) setSelectedPrinter(saved);
    }
    loadPrinters();
  }, []);

  const MAX_FILE_SIZE_MB = 2;
  const MAX_WIDTH = 1748;
  const MAX_HEIGHT = 2480;

  const compressImageIfNeeded = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target) return reject("FileReader error");
        img.src = e.target.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);

      img.onload = () => {
        let { width, height } = img;

        // Resize proportionally if too big
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context error");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.95;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject("Canvas toBlob error");
              const sizeMB = blob.size / 1024 / 1024;

              if ((sizeMB > MAX_FILE_SIZE_MB || width > MAX_WIDTH || height > MAX_HEIGHT) && quality > 0.5) {
                quality -= 0.05;
                tryCompress();
              } else {
                resolve(new File([blob], file.name, { type: file.type }));
              }
            },
            file.type,
            quality
          );
        };

        tryCompress();
      };

      img.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    try {
      setUploadCompleted(false);

      const processedFile = await compressImageIfNeeded(file);

      if (processedFile.size < file.size) {
        setCompressionNotice(
          `⚠️ Your image was compressed to fit size/resolution limits (max ${MAX_FILE_SIZE_MB} MB, ${MAX_WIDTH}×${MAX_HEIGHT}). Quality may be slightly reduced.`
        );
      } else {
        setCompressionNotice('');
      }

      // Continue with upload to Firebase Storage...
      const fileRef = ref(storage, `printJobs/${Date.now()}-${processedFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, processedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => console.error("Upload failed:", error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedFile(processedFile);
          setImageUrl(url);
          setUploadCompleted(true);
          localStorage.setItem("lastStoragePath", uploadTask.snapshot.ref.fullPath); // save full path
        }
      );
    } catch (err) {
      console.error("Unexpected error during upload:", err);
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
  try {
    // 🖨️ 1️⃣ Get currently selected printer
    const printerId = getConnectedPrinter(); // from PrinterService.ts
    if (!printerId || printerId === "default-printer") {
      alert("⚠️ Please select a printer before payment!");
      return;
    }

    // 🔍 2️⃣ Check Firestore if printer actually exists
    const printerRef = doc(db, "printers", printerId);
    const printerSnap = await getDoc(printerRef);

    if (!printerSnap.exists()) {
      alert(`❌ Printer ${printerId} is not registered in Firestore!`);
      return;
    }

    console.log(`🖨️ Printer ${printerId} verified in Firestore.`);

    // 🧾 3️⃣ Prepare print job options
    const options = {
      copies: quantity,
      size: selectedSize?.name || "Unknown",
      fitToPage: true,
    };

    // 🪄 4️⃣ Create Firestore job
    const jobId = await submitPrintJob(imageUrl, options, printerId);
    console.log(`✅ Print job created successfully with ID: ${jobId}`);

    // 💾 5️⃣ (Optional) Save last used printer for next time
    localStorage.setItem("selectedPrinter", printerId);

    // 🎉 6️⃣ Proceed to print modal or confirmation
    setShowPayment(false);
    setCompletedOrder(prev => {
      if (!prev) return prev; // ⛔ nothing to update if null
      return {
        ...prev,
        jobId,
        printerId,
      };
    });
    setShowPrint(true);
  } catch (err) {
    console.error("❌ Payment succeeded, but job creation failed:", err);
    alert("Something went wrong while creating the print job. Please try again.");
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
                setCompressionNotice(''); // ✅ reset warning
              }}
              onDeleteFromStorage={async (filePath: string) => {
                if (!filePath) return;
                try {
                  const storageRef = ref(storage, filePath);
                  await deleteObject(storageRef);
                  console.log('✅ File deleted from Firebase storage');
                } catch (err) {
                  console.error('❌ Failed to delete from storage:', err);
                }
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
            {/* ⚠️ Compression notice */}
            {compressionNotice && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <p className="text-yellow-700 text-sm">{compressionNotice}</p>
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

            {/* 🖨️ Printer selection dropdown */}
            {selectedSize && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Select Printer</h3>
                <div className="space-y-2">
                  <select
                    value={selectedPrinter}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedPrinter(id);
                      localStorage.setItem("selectedPrinter", id);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="">-- Choose Printer --</option>
                    {printers.map((printer) => (
                      <option key={printer.id} value={printer.id}>
                        {printer.name || printer.id}
                      </option>
                    ))}
                  </select>

                  {selectedPrinter && (
                    <p className="text-sm text-gray-600">
                      Selected printer: <span className="font-medium text-gray-900">{selectedPrinter}</span>
                    </p>
                  )}
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
                  <div className="mt-3 p-3 bg-yellow-50 border border-red-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-yellow-700 font-medium">Notice: Slightly low resolution</p>
                      <p className="text-yellow-600 text-sm">
                        Your image is slightly below the recommended resolution for {selectedSize.name} printing, 
                        but it can still be printed. Quality may be slightly reduced.
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