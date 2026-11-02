export type EmailTemplateArgs = {
  recipientName: string
  actionUrl: string
  expiresIn: string
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const baseEmailLayout = ({
  title,
  heading,
  bodyParagraph,
  ctaText,
  actionUrl,
  expiryText,
  footerNote,
}: {
  title: string
  heading: string
  bodyParagraph: string
  ctaText: string
  actionUrl: string
  expiryText: string
  footerNote: string
}) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      body {
        margin: 0;
        padding: 0;
        background-color: #0b1120;
        color: #e2e8f0;
        font-family: Arial, Helvetica, sans-serif;
      }
      @media screen and (max-width: 600px) {
        .wrapper { width: 100% !important; }
        .content { padding: 24px 20px 20px !important; }
        .button { display: block !important; width: 100% !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#0b1120; color:#e2e8f0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0b1120; margin:0; padding:0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" style="max-width:600px; background:linear-gradient(180deg, #111827 0%, #171a2b 100%); border:1px solid rgba(167, 139, 250, 0.35); border-radius:20px; overflow:hidden;">
            <tr>
              <td style="padding:24px 32px 12px; text-align:left; background:rgba(17, 24, 39, 0.92);">
                <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#c4b5fd; font-weight:bold;">
                  PromptMuse
                </div>
              </td>
            </tr>
            <tr>
              <td class="content" style="padding:16px 32px 28px;">
                <h1 style="margin:0 0 18px; color:#f8fafc; font-size:32px; line-height:1.2; font-weight:700; letter-spacing:-0.03em;">
                  ${heading}
                </h1>

                <p style="margin:0 0 20px; color:#cbd5e1; font-size:16px; line-height:1.7;">
                  ${bodyParagraph}
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
                  <tr>
                    <td align="center" bgcolor="#7c3aed" style="border-radius:12px;">
                      <a href="${actionUrl}" class="button" style="display:inline-block; padding:14px 26px; font-size:16px; font-weight:700; color:#f8fafc; text-decoration:none; border-radius:12px; background:linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 12px; color:#cbd5e1; font-size:14px; line-height:1.7;">
                  ${expiryText}
                </p>

                <p style="margin:0 0 18px; color:#cbd5e1; font-size:14px; line-height:1.7;">
                  If the button does not work, copy and paste this URL into your browser:<br />
                  <a href="${actionUrl}" style="color:#c4b5fd; word-break:break-all;">${actionUrl}</a>
                </p>

                <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.7; border-top:1px solid rgba(148, 163, 184, 0.25); padding-top:16px;">
                  ${footerNote}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px; color:#94a3b8; font-size:12px; line-height:1.6; text-align:center;">
                PromptMuse • Create better prompts, with clarity and confidence.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

export const buildVerificationEmailTemplate = ({ recipientName, actionUrl, expiresIn }: EmailTemplateArgs) => {
  const safeName = escapeHtml(recipientName || 'there')
  const safeActionUrl = escapeHtml(actionUrl)
  const safeExpiresIn = escapeHtml(expiresIn)

  const subject = 'Verify your PromptMuse account'
  const heading = 'Verify your email'
  const bodyParagraph = `Hi ${safeName}, welcome to PromptMuse. Please confirm your email address to finish setting up your account and start creating smarter prompts.`
  const expiryText = `This verification link expires in ${safeExpiresIn}.` 
  const footerNote = 'For your security, never share this email with anyone else. If you did not create a PromptMuse account, you can ignore this message.'

  return {
    subject,
    html: baseEmailLayout({
      title: subject,
      heading,
      bodyParagraph,
      ctaText: 'Verify email',
      actionUrl: safeActionUrl,
      expiryText,
      footerNote,
    }),
    text: `Hi ${recipientName || 'there'},\n\nWelcome to PromptMuse. Please confirm your email address by visiting: ${actionUrl}\n\nThis verification link expires in ${expiresIn}.\n\nFor your security, never share this email with anyone else. If you did not create a PromptMuse account, you can ignore this message.`,
  }
}

export const buildPasswordResetEmailTemplate = ({ recipientName, actionUrl, expiresIn }: EmailTemplateArgs) => {
  const safeName = escapeHtml(recipientName || 'there')
  const safeActionUrl = escapeHtml(actionUrl)
  const safeExpiresIn = escapeHtml(expiresIn)

  const subject = 'Reset your PromptMuse password'
  const heading = 'Reset your password'
  const bodyParagraph = `Hi ${safeName}, we received a request to reset the password for your PromptMuse account. Use the button below to choose a new password and continue securely.`
  const expiryText = `This password reset link expires in ${safeExpiresIn}.`
  const footerNote = 'For your security, this link can only be used once. If you did not request a password reset, you can safely ignore this message.'

  return {
    subject,
    html: baseEmailLayout({
      title: subject,
      heading,
      bodyParagraph,
      ctaText: 'Reset password',
      actionUrl: safeActionUrl,
      expiryText,
      footerNote,
    }),
    text: `Hi ${recipientName || 'there'},\n\nWe received a request to reset the password for your PromptMuse account. Use the following link to create a new password: ${actionUrl}\n\nThis password reset link expires in ${expiresIn}.\n\nFor your security, this link can only be used once. If you did not request a password reset, you can safely ignore this message.`,
  }
}
