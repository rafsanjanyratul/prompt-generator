import nodemailer, { type Transporter } from 'nodemailer'
import { Resend } from 'resend'

import { env } from '../config/env.js'

export type SendEmailOptions = {
  to: string | string[]
  subject: string
  html: string
  text: string
  from?: string
}

let smtpTransporter: Transporter | null = null
let resendClient: Resend | null = null

function getSmtpTransporter(): Transporter {
  if (!smtpTransporter) {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error('SMTP credentials are not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.')
    }
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  }
  return smtpTransporter
}

function getResendClient(): Resend {
  if (!resendClient) {
    if (!env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured.')
    }
    resendClient = new Resend(env.RESEND_API_KEY)
  }
  return resendClient
}

async function sendViaResend(options: SendEmailOptions) {
  const resend = getResendClient()
  const fromEmail = options.from ?? env.RESEND_FROM_EMAIL
  if (!fromEmail) {
    throw new Error('RESEND_FROM_EMAIL is not configured.')
  }
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
  })

  if (error) {
    throw new Error(`Resend email delivery failed: ${error.message}`)
  }

  return { messageId: data?.id }
}

async function sendViaSmtp(options: SendEmailOptions) {
  const transporter = getSmtpTransporter()
  return transporter.sendMail({
    from: options.from ?? env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions) {
  if (env.EMAIL_PROVIDER === 'resend') {
    return sendViaResend({ to, subject, html, text, from })
  }

  return sendViaSmtp({ to, subject, html, text, from })
}
