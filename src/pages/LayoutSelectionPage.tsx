import React, { useState } from "react";
import { ArrowLeft, Layout, Copy, Check } from "lucide-react";
import PaymentModal from "../components/PaymentModal";  // ✅ add this import
import { getConnectedPrinter, submitPrintJob } from "../services/PrinterService";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";

interface LayoutSelectionPageProps {
  onBack: () => void;
  onSelectLayout: (layout: "fullA5" | "two4x6") => void;
}

const LayoutSelectionPage: React.FC<LayoutSelectionPageProps> = ({
  onBack,
  onSelectLayout,
}) => {
  const [selectedLayout, setSelectedLayout] = useState<"fullA5" | "two4x6" | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative">
      {/* 🔙 Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      {/* 🏷️ Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Choose Print Layout
      </h1>

      {/* 🧩 Layout Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Option 1 — Full A5 */}
        <button
          onClick={() => setSelectedLayout("fullA5")}
          className={`bg-white border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all ${
            selectedLayout === "fullA5"
              ? "border-blue-500 ring-2 ring-blue-200"
              : "border-gray-200"
          }`}
        >
          <Layout className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">
            Full A5 Photo
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Print your photo filling the entire A5 paper.
          </p>

          {/* 🖼 Preview Mockup for Full A5 */}
          <div className="mt-4 bg-gray-100 border rounded-lg overflow-hidden p-3 flex justify-center">
          <div className="relative bg-white w-[160px] h-[230px] border border-gray-300 shadow-inner">
              <div className="absolute inset-2 bg-blue-200 flex flex-col items-center justify-center text-xs text-gray-700 font-medium">
              <span>A5</span>
              <span>Full Photo</span>
              </div>
          </div>
          </div>
        </button>

        {/* Option 2 — Two 4×6 on A5 */}
        <button
          onClick={() => setSelectedLayout("two4x6")}
          className={`bg-white border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all ${
            selectedLayout === "two4x6"
              ? "border-blue-500 ring-2 ring-blue-200"
              : "border-gray-200"
          }`}
        >
          <Copy className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">
            Two 4×6 on A5
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Duplicate the same photo twice on a single A5 sheet.
          </p>

          {/* 🖼 Preview Mockup for Two 4×6 */}
          <div className="mt-4 bg-gray-100 border rounded-lg overflow-hidden p-3 flex justify-center">
            <div className="relative bg-white w-[160px] h-[230px] border border-gray-300 shadow-inner flex flex-col items-center justify-between py-2">
              <div className="bg-blue-200 w-[140px] h-[95px] flex items-center justify-center text-xs text-gray-700 font-medium">
                4×6 #1
              </div>
              <div className="bg-blue-200 w-[140px] h-[95px] flex items-center justify-center text-xs text-gray-700 font-medium">
                4×6 #2
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* ✅ Proceed Button */}
      {selectedLayout && (
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center mb-4 space-x-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">
              Selected layout:{" "}
              {selectedLayout === "fullA5" ? "Full A5 Photo" : "Two 4×6 on A5"}
            </span>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Proceed to Payment
          </button>
        </div>
      )}
      {showPayment && (
      <PaymentModal
        order={{
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: localStorage.getItem("uploadedImageUrl") || "",
          printSize: { 
            id: "a5", 
            name: "A5", 
            dimensions: "148×210 mm", 
            price: 1.99,
            minResolution: { width: 1160, height: 1654 } // ✅ required fix
          },
          quantity: 1,
          totalPrice: 1.99,
          layout: selectedLayout || undefined, // ✅ converts null → undefined
        }}
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          const order = {
            imageUrl: localStorage.getItem("uploadedImageUrl") || "",
            printSize: { 
              id: "a5", 
              name: "A5", 
              dimensions: "148×210 mm", 
              price: 1.99,
              minResolution: { width: 1160, height: 1654 }
            },
            quantity: 1,
            totalPrice: 1.99,
            layout: selectedLayout || undefined,
          };
          handlePaymentSuccess(order);
        }}
      />
    )}
    </div>
  );
};

const handlePaymentSuccess = async (order: any) => {
  try {
    // 1️⃣ Get currently selected printer
    const printerId = getConnectedPrinter();
    if (!printerId || printerId === "default-printer") {
      alert("⚠️ Please select a printer before payment!");
      return;
    }

    // 2️⃣ Verify printer exists in Firestore
    const printerRef = doc(db, "printers", printerId);
    const printerSnap = await getDoc(printerRef);
    if (!printerSnap.exists()) {
      alert(`❌ Printer ${printerId} is not registered in Firestore!`);
      return;
    }
    console.log(`🖨️ Printer ${printerId} verified.`);

    // 3️⃣ Prepare print job options for backend Sharp
    const options = {
      copies: order.quantity,
      size: order.printSize?.name || "A5",
      layout: order.layout, // send layout info for Sharp
    };

    // 4️⃣ Submit Firestore job — backend Sharp will process the image
    // Backend should handle resizing/duplication
    const jobId = await submitPrintJob(order.imageUrl, options, printerId);
    console.log(`✅ Print job created successfully with ID: ${jobId}`);

    // 5️⃣ Save last used printer
    localStorage.setItem("selectedPrinter", printerId);

    // 6️⃣ Notify frontend
    alert("✅ Payment successful. Print job sent to backend for processing!");

    // Optional: update local state if needed
    // setCompletedOrder({ ...order, jobId, printerId });
    // setShowPrint(true);

  } catch (err) {
    console.error("❌ Payment succeeded, but job creation failed:", err);
    alert("Something went wrong while creating the print job. Please try again.");
  }
};

export default LayoutSelectionPage;
