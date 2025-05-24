import { promisify } from "util";

import nodemailer from "nodemailer";

import { EMAIL_PASS, EMAIL_FROM } from "@/lib/utils/config";

const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey",
    pass: EMAIL_PASS,
  },
});

const sendMail = promisify(transporter.sendMail.bind(transporter));

export function send(opts: { x: string }) {
  return sendMail({ from: EMAIL_FROM, ...opts });
}
