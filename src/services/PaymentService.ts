// Payment service that should be moved to server-side for production
export class PaymentService {
  private baseUrl: string;

  constructor() {
    // In production, this should be handled server-side
    this.baseUrl = 'https://api.xendit.co';
  }

  // This method should be moved to your backend server
  async createPaymentIntent(order: any, customerEmail: string) {
    // For demo purposes - in production, call your backend API
    console.warn('Payment processing should be handled server-side in production');
    
    // Simulate payment creation
    return {
      id: `payment_${Date.now()}`,
      amount: Math.round((order.totalPrice + 2.99) * 100),
      currency: 'USD',
      status: 'pending'
    };
  }

  // Simulate payment processing for demo
  async simulatePayment(orderId: string): Promise<{ success: boolean; transactionId: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      transactionId: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
}

export const paymentService = new PaymentService();