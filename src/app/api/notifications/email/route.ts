import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html, text, priority } = await request.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'ailabs.2208@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'xnhz kqzw aotw pdbn',
      },
    });

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'ailabs.2208@gmail.com',
      to,
      subject,
      html,
      text
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 