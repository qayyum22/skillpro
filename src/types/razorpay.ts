export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayOptions) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

declare global {
  interface Window {
    Razorpay: {
      new (options: any): {
        open: () => void;
        on: (event: string, callback: (response: any) => void) => void;
      };
    }
  }
}

export {}
