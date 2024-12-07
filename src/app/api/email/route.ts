import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { fromEmail, toEmail, message, attachment } = await request.json();

    console.log("=== Server Request Details ===");
    console.log("1. fromEmail:", fromEmail);
    console.log("2. toEmail:", toEmail);
    console.log("3. message:", message);
    console.log("4. Attachment exists:", !!attachment);

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const base64Data = attachment.split("base64,")[1];
    const imageBuffer = Buffer.from(base64Data, "base64");

    let mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: "New Drawing from Website",
      text: message,
      attachments: [
        {
          filename: "drawing.png",
          content: imageBuffer,
          encoding: "base64",
          contentType: "image/png",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
} 