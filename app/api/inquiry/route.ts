import { Resend } from "resend";
import { NextResponse } from "next/server";

type InquiryBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.RESEND_TO_EMAIL;

  if (!apiKey || !from || !to) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  let body: InquiryBody;

  try {
    body = (await request.json()) as InquiryBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Please complete all fields before sending." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `De Eclat Inquiry: ${subject}`,
    html: `
      <div style="font-family: Georgia, serif; color: #333; line-height: 1.6;">
        <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #b31b1b;">
          New inquiry from de-eclat.com
        </p>
        <h1 style="font-size: 24px; font-weight: normal; margin: 16px 0 8px;">
          ${safeSubject}
        </h1>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin-top: 24px;"><strong>Message</strong></p>
        <p>${safeMessage}</p>
      </div>
    `
  });

  if (error) {
    console.error("Resend error:", error);

    const resendMessage =
      typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : "";

    if (resendMessage.includes("only send testing emails to your own email")) {
      return NextResponse.json(
        {
          error:
            "Email is in test mode. Set RESEND_TO_EMAIL to your Resend account email, or verify a domain at resend.com/domains."
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && resendMessage
            ? resendMessage
            : "Unable to send your inquiry. Please try again shortly."
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
