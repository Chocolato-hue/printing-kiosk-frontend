import React, { useState } from 'react';
import { X, CreditCard, Lock, Smartphone, Wallet, Building2, ExternalLink } from 'lucide-react';
import { PrintOrder } from '../types/PrintOrder';
import { paymentService } from '../services/PaymentService';

interface PaymentModalProps {
  order: PrintOrder;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ order, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ewallet' | 'bank'>('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: '',
    bankCode: '',
    ewalletType: 'OVO'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);
    
    try {
      // For demo purposes, we'll simulate the payment
      // In production, you would create a Xendit invoice and redirect to payment page
      const result = await paymentService.simulatePayment(order.id);
      
      if (result.success) {
        onSuccess();
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Payment processing error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{order.printSize.name}</span>
                <span>${order.printSize.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity</span>
                <span>{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>$2.99</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">${(order.totalPrice + 2.99).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Credit Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('ewallet')}
                className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition-all ${
                  paymentMethod === 'ewallet' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet className="h-5 w-5" />
                <span>E-Wallet</span>
              </button>
              
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`p-3 border rounded-lg flex items-center justify-center space-x-2 transition-all ${
                  paymentMethod === 'bank' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2 className="h-5 w-5" />
                <span>Bank Transfer</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {paymentMethod === 'card' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            ) : paymentMethod === 'ewallet' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Wallet Type
                  </label>
                  <select
                    name="ewalletType"
                    value={formData.ewalletType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="OVO">OVO</option>
                    <option value="DANA">DANA</option>
                    <option value="LINKAJA">LinkAja</option>
                    <option value="SHOPEEPAY">ShopeePay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  You'll receive bank transfer instructions via email
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <Lock className="h-4 w-4" />
              <span>Secured by Xendit - Your payment information is encrypted and secure</span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `Pay $${(order.totalPrice + 2.99).toFixed(2)}`
              )}
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Powered by <span className="font-semibold">Xendit</span> - Secure payment processing
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;