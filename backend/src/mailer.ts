import nodemailer from "nodemailer";
import env from "./env";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

function createTransporter() {
  if (!env.MAILJET_SMTP_USER || !env.MAILJET_SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: "in-v3.mailjet.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: env.MAILJET_SMTP_USER,
      pass: env.MAILJET_SMTP_PASS,
    },
  });
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "[mailer] MAILJET_SMTP_USER / MAILJET_SMTP_PASS not configured — skipping email send",
    );
    return;
  }

  const from = env.MAILJET_FROM_EMAIL ?? env.MAILJET_SMTP_USER;

  await transporter.sendMail({ from, to, subject, html });
}
