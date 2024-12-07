import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { fromEmail, message } = await request.json();

    if (!fromEmail || !message) {
      return NextResponse.json(
        { success: false, error: "Email and message are required" },
        { status: 400 }
      );
    }

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: fromEmail,
      to: "kirillginko@gmail.com",
      subject: `New message from ${fromEmail}`,
      text: message,
      replyTo: fromEmail, // This allows you to reply directly to the sender
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
} 