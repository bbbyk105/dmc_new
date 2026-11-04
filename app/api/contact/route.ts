import { NextRequest, NextResponse } from "next/server";
import { createContactEmailTemplate, createAutoReplyTemplate } from "@/lib/email";
import { mailFrom, resendClient, sendViaResend, shopInbox } from "@/lib/mail/resend";

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

    const contactEmail = createContactEmailTemplate(body);
    const autoReply = createAutoReplyTemplate(body.name, body.locale);
    const mails = [
      // お店へ（返信するとお客さまに届く）
      { to: shopInbox(), subject: contactEmail.subject, text: contactEmail.text, html: contactEmail.html, replyTo: body.email },
      // お客さまへの自動返信（返信するとお店に届く）
      { to: body.email, subject: autoReply.subject, text: autoReply.text, html: autoReply.html, replyTo: shopInbox() },
    ];

    // 手元の確認では送らずにログへ出す（予約・注文のメールと同じ）
    if (process.env.MAIL_MODE === "log") {
      for (const m of mails) console.info(`[mail] to=${m.to} subject=${m.subject}`);
      return NextResponse.json({ success: true, message: "Email logged" }, { status: 200 });
    }

    // メールは Resend で送る（RESEND_API_KEY が無いと送れない）
    const client = resendClient();
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
        },
        { status: 500 }
      );
    }

    await sendViaResend(mails, { client, from: mailFrom() });

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
