import React, { useState } from 'react';
import { X, Printer, Mail, Download, Check, Wifi, AlertCircle } from 'lucide-react';
import { PrintOrder } from '../types/PrintOrder';
import { checkHealth, submitPrintJob } from '../services/PrinterService'; // ✅ fixed import
import PrintSettingsModal from './PrintSettingsModal'; // ✅ fixed import

interface PrintModalProps {
  order: PrintOrder;
  onClose: () => void;
}

const PrintModal: React.FC<PrintModalProps> = ({ order, onClose }) => {
  const [printMethod, setPrintMethod] = useState<'physical' | 'browser' | 'email'>('physical');
  const [emailAddress, setEmailAddress] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [printSuccess, setPrintSuccess] = useState<string | null>(null);
    
   // NEW: settings from PrintSettingsModal
  const [settings, setSettings] = useState<any>(null);

  const handleSettingsChange = (newSettings: any) => {
    setSettings(newSettings);
  };

 const handlePhysicalPrint = async () => {
  setPrinting(true);
  setPrintError(null);
  setPrintSuccess(null);

  try {
    // Optional: check Firestore connectivity
    await checkHealth();

    // Submit print job (returns job ID as string)
    const jobId = await submitPrintJob(
      order.imageUrl,
      settings?.options || {
        size: order.printSize.id,
        copies: order.quantity,
      },
      settings?.printer?.name // printerId string
    );

    setPrintSuccess(`Print job sent successfully! Job ID: ${jobId}`);

    // Auto-close modal after 3 seconds
    setTimeout(() => {
      onClose();
    }, 3000);
  } catch (error) {
    if (error instanceof Error) {
      setPrintError(`Failed to send print job: ${error.message}`);
    } else {
      setPrintError(
        "An unexpected error occurred while sending the print job."
      );
    }
  } finally {
    setPrinting(false);
  }
};

  const handleBrowserPrint = () => {
    // Create a new window with the image for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print - ${order.printSize.name}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                text-align: center;
              }
              .print-info {
                margin-bottom: 20px;
                font-size: 14px;
                color: #666;
              }
              .image-container {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 80vh;
              }
              img {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
                border: 1px solid #ddd;
              }
              @media print {
                .print-info { display: none; }
                body { padding: 0; }
                .image-container { min-height: auto; }
                img { 
                  width: 100%; 
                  height: auto; 
                  border: none;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-info">
              <h2>Print Preview - ${order.printSize.name}</h2>
              <p>Size: ${order.printSize.dimensions} | Quantity: ${order.quantity}</p>
              <p>Press Ctrl+P (Cmd+P on Mac) to print</p>
            </div>
            <div class="image-container">
              <img src="${order.imageUrl}" alt="Print Image" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleEmailSend = async () => {
    if (!emailAddress) return;
    
    setSending(true);
    
    // Simulate email sending
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = order.imageUrl;
    link.download = `print-${order.printSize.id}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h3>
            <p className="text-gray-600 mb-6">
              Print instructions have been sent to {emailAddress}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (printSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Print Job Sent!</h3>
            <p className="text-gray-600 mb-6">
              {printSuccess}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your photo is being printed on the HP N451NW printer via Dell Wyse terminal.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Print Your Photo</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Your Order</h3>
            <div className="flex items-center space-x-4">
              <img
                src={order.imageUrl}
                alt="Print preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium text-gray-900">{order.printSize.name}</p>
                <p className="text-gray-600">{order.printSize.dimensions}</p>
                <p className="text-gray-600">Quantity: {order.quantity}</p>
              </div>
            </div>
          </div>

          {/* Print Method Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">How would you like to print?</h3>
            <div className="space-y-3">
              <button
                onClick={() => setPrintMethod('physical')}
                className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-all ${
                  printMethod === 'physical' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wifi className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Print to HP N451NW</p>
                  <p className="text-sm text-gray-600">Send directly to physical printer via Dell Wyse</p>
                </div>
              </button>
              
              <button
                onClick={() => setPrintMethod('browser')}
                className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-all ${
                  printMethod === 'browser' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Printer className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Print Now</p>
                  <p className="text-sm text-gray-600">Open print dialog in your browser</p>
                </div>
              </button>
              
              <button
                onClick={() => setPrintMethod('email')}
                className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-all ${
                  printMethod === 'email' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Email Print Instructions</p>
                  <p className="text-sm text-gray-600">Send to your email for later printing</p>
                </div>
              </button>
            </div>
          </div>

          {/* Email Input */}
          {printMethod === 'email' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Print Error */}
          {printError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Print Failed</p>
                <p className="text-red-600 text-sm">{printError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {printMethod === 'physical' ? (
              <button
                onClick={handlePhysicalPrint}
                disabled={printing}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {printing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending to Printer...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="h-5 w-5" />
                    <span>Print on {settings?.printer?.name || "HP_LaserJet"}</span>
                  </>
                )}
              </button>
            ) : printMethod === 'browser' ? (
              <button
                onClick={handleBrowserPrint}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="h-5 w-5" />
                <span>Open Print Dialog</span>
              </button>
            ) : (
              <button
                onClick={handleEmailSend}
                disabled={!emailAddress || sending}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    <span>Send Print Instructions</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleDownload}
              className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download Image</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Tip:</strong> {printMethod === 'physical' 
                ? 'Physical printing sends your photo directly to the HP N451NW printer via Dell Wyse terminal.'
                : 'For best results, use high-quality photo paper and ensure your printer settings match the selected print size.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;