import { NextRequest, NextResponse } from "next/server";
import {
  createTransporter,
  createContactEmailTemplate,
  createAutoReplyTemplate,
} from "@/lib/email";

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  locale: string;
};

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateFormData(data: ContactFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push("Valid email is required");
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push("Message is required");
  }

  if (data.message && data.message.length > 5000) {
    errors.push("Message is too long (max 5000 characters)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    const validation = validateFormData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
        },
        { status: 500 }
      );
    }

    const transporter = createTransporter();
    await transporter.verify();

    const contactEmail = createContactEmailTemplate(body);
    const autoReply = createAutoReplyTemplate(body.name, body.locale);

    await Promise.all([
      transporter.sendMail({
        from: `"DMC Contact Form" <${process.env.GMAIL_USER}>`,
        to: process.env.CONTACT_EMAIL || process.env.GMAIL_USER,
        subject: contactEmail.subject,
        text: contactEmail.text,
        html: contactEmail.html,
        replyTo: body.email,
      }),
      transporter.sendMail({
        from: `"DMC" <${process.env.GMAIL_USER}>`,
        to: body.email,
        subject: autoReply.subject,
        text: autoReply.text,
        html: autoReply.html,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
