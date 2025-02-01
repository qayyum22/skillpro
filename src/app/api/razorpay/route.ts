import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req: NextRequest, res: NextResponse) {
  if (req.method === 'POST') {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    try {
      const options = {
        amount: req.body.amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: shortid.generate(),
        // Add any additional notes or options here if needed
      };

      const order = await razorpay.orders.create(options);
      res.status(200).json({
        id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}