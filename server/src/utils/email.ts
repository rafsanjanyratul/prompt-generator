import nodemailer from 'nodemailer'

import { env } from '../config/env.js'

export type SendEmailOptions = {
  to: string | string[]
  subject: string
  html: string
  text: string
  from?: string
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  from = env.SMTP_FROM,
}: SendEmailOptions) {
  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  })
}
