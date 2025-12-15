import { useState } from "react";
import { ArrowLeft, Layout, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import { getConnectedPrinter, submitPrintJob } from "../services/PrinterService";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";

type LayoutType = "fullA5" | "two4x6";

const LayoutSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedLayout, setSelectedLayout] = useState<LayoutType | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentSuccess = async () => {
    try {
      const imageUrl = localStorage.getItem("uploadedImageUrl");
      const printerId = getConnectedPrinter();

      if (!imageUrl) {
        alert("❌ Image not found. Please upload again.");
        navigate("/upload/single");
        return;
      }

      if (!printerId || printerId === "default-printer") {
        alert("⚠️ Printer not selected.");
        return;
      }

      // 🔍 Verify printer exists
      const printerRef = doc(db, "printers", printerId);
      const printerSnap = await getDoc(printerRef);
      if (!printerSnap.exists()) {
        alert("❌ Printer is not registered.");
        return;
      }

      const options = {
        size: "A5",
        copies: 1,
        layout: selectedLayout, // 🔑 Sharp layout
      };

      await submitPrintJob(imageUrl, options, printerId);

      alert("✅ Payment successful. Your print job is in queue.");

      // clean up
      localStorage.removeItem("uploadedImageUrl");
      localStorage.removeItem("uploadedFileName");

      navigate("/queue"); // 👈 future queue page (safe)
    } catch (err) {
      console.error("Print job error:", err);
      alert("❌ Payment succeeded, but printing failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Choose Print Layout
      </h1>

      {/* Layout Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Full A5 */}
        <button
          onClick={() => setSelectedLayout("fullA5")}
          className={`bg-white border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all ${
            selectedLayout === "fullA5"
              ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
              : "border-gray-200 shadow-sm hover:shadow-md"
          }`}
        >
          <Layout className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Full A5 Photo</h2>
          <p className="text-gray-600 text-sm mt-2">
            One photo fills the entire A5 sheet
          </p>

          {/* 🖼️ Preview Mockup for Full A5 */}
          <div className="mt-4 bg-gray-100 border rounded-lg overflow-hidden p-3 flex justify-center">
            <div className="relative bg-white w-[160px] h-[230px] border border-gray-300 shadow-inner">
              <div className="absolute inset-2 bg-blue-200 flex flex-col items-center justify-center text-xs text-gray-700 font-medium">
                <span>A5</span>
                <span>Full Photo</span>
              </div>
            </div>
          </div>
        </button>

        {/* Two 4x6 */}
        <button
          onClick={() => setSelectedLayout("two4x6")}
          className={`bg-white border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all ${
            selectedLayout === "two4x6"
              ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
              : "border-gray-200 shadow-sm hover:shadow-md"
          }`}
        >
          <Copy className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Two 4×6 on A5</h2>
          <p className="text-gray-600 text-sm mt-2">
            Two identical photos on one A5 sheet
          </p>

          {/* 🖼️ Preview Mockup for Two 4×6 */}
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

      {/* Proceed */}
      {selectedLayout && (
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <Check className="h-5 w-5" />
            <span>
              Selected:{" "}
              {selectedLayout === "fullA5" ? "Full A5" : "Two 4×6"}
            </span>
          </div>

          <button
            onClick={() => {
              localStorage.setItem("selectedLayout", selectedLayout);
              setShowPayment(true);
            }}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700"
          >
            Proceed to Payment
          </button>
        </div>
      )}

      {showPayment && (
        <PaymentModal
          order={{
            id: crypto.randomUUID(),
            imageUrl: localStorage.getItem("uploadedImageUrl") || "",
            printSize: {
              id: "a5",
              name: "A5",
              dimensions: "148×210 mm",
              price: 1.99,
              minResolution: { width: 1160, height: 1654 },
            },
            quantity: 1,
            totalPrice: 1.99,
            layout: selectedLayout!,
          }}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default LayoutSelectionPage;
