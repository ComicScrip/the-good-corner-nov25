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
  const transporter = nodemailer.createTransport({
    host: "in-v3.mailjet.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: env.MAILJET_SMTP_USER,
      pass: env.MAILJET_SMTP_PASS,
    },
  });
  const from = env.MAILJET_FROM_EMAIL;
  await transporter.sendMail({ from, to, subject, html });
}
