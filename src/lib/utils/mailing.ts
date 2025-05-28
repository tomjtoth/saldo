import { promisify } from "util";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey",
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = promisify(transporter.sendMail.bind(transporter));

export function send(opts: { x: string }) {
  return sendMail({ from: process.env.EMAIL_FROM, ...opts });
}
