import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("=== API Request Details ===");
    console.log("1. Request method:", request.method);

    const body = await request.json();
    console.log("2. Request body keys:", Object.keys(body));

    const { fromEmail, toEmail, message, attachment } = body;

    console.log("3. fromEmail:", fromEmail);
    console.log("4. toEmail:", toEmail);
    console.log("5. message:", message);
    console.log("6. Attachment exists:", !!attachment);

    // Create transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true,
    });

    // Convert base64 to buffer directly
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
          contentDisposition: "attachment",
        },
      ],
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to send email: " + error.message },
      { status: 500 }
    );
  }
}
