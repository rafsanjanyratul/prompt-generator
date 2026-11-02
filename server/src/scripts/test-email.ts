import { sendTransactionalEmail } from '../utils/email.js'

const testEmail = process.env.TEST_EMAIL?.trim()

if (!testEmail) {
  console.error('TEST_EMAIL is not set. Add TEST_EMAIL=<recipient@example.com> before running the SMTP test.')
  process.exit(1)
}

const run = async () => {
  try {
    const result = await sendTransactionalEmail({
      to: testEmail,
      subject: 'PromptMuse SMTP Test',
      text: 'This is a PromptMuse SMTP test email. If you received it, Gmail SMTP is working.',
      html: `
        <div style="font-family: Arial, sans-serif; background: #0b1120; color: #e2e8f0; padding: 24px;">
          <div style="max-width: 520px; margin: 0 auto; background: #111827; border: 1px solid #3b3a63; border-radius: 12px; padding: 24px;">
            <h2 style="margin: 0 0 12px; color: #f8fafc;">PromptMuse SMTP Test</h2>
            <p style="margin: 0; line-height: 1.6; color: #cbd5e1;">
              This is a PromptMuse SMTP test email. If you received it, Gmail SMTP is working correctly.
            </p>
          </div>
        </div>
      `,
    })

    console.log('SMTP test email sent successfully.')
    console.log(JSON.stringify({ messageId: result.messageId }, null, 2))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP error'
    console.error('SMTP test failed:', message)
    process.exit(1)
  }
}

void run()
