"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailValues {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: SendEmailValues) {
  const appName = process.env.APP_NAME;

  try {
    await transporter.sendMail({
      from: {
        name: appName as string,
        address: process.env.SMTP_USER as string,
      },
      to,
      subject,
      text,
    });
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: `Failed to send email to ${to}: ${e}`,
    };
  }
}
