import nodemailer from "nodemailer";
import env from "./env";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({
  to,
  subject,
  html,
}: MailOptions): Promise<void> {
  const host = env.MAILJET_SMTP_HOST ?? "in-v3.mailjet.com";
  const port = env.MAILJET_SMTP_PORT ?? 587;
  // When pointing at Mailpit (or any unauthenticated relay) the credentials
  // will be empty strings — nodemailer skips AUTH automatically when both
  // user and pass are falsy.
  const auth =
    env.MAILJET_SMTP_USER && env.MAILJET_SMTP_PASS
      ? { user: env.MAILJET_SMTP_USER, pass: env.MAILJET_SMTP_PASS }
      : undefined;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    requireTLS: port !== 1025, // skip STARTTLS for local dev/test relays
    auth,
  });
  const from = env.MAILJET_FROM_EMAIL ?? "noreply@localhost";
  await transporter.sendMail({ from, to, subject, html });
}
