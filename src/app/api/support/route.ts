import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, issue, message, targetEmail } = await request.json();

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Create a transporter
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
      to: targetEmail || 'ailabs.2208@gmail.com',
      subject: `Support Request: ${subject || 'No Subject'}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'Not provided'}</p>
        <p><strong>Issue Description:</strong> ${issue || 'Not provided'}</p>
        <h3>Conversation History:</h3>
        <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</pre>
      `,
      text: `
        New Support Request
        ------------------
        From: ${name}
        Email: ${email}
        Subject: ${subject || 'Not provided'}
        Issue Description: ${issue || 'Not provided'}
        
        Conversation History:
        ${message}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support email error:', error);
    return NextResponse.json(
      { error: 'Failed to send support request' },
      { status: 500 }
    );
  }
} 