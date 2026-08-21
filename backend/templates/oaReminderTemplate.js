/**
 * Reusable OA Reminder Email Template
 * Produces clean, email-client-compatible HTML and plain-text fallback.
 */

/**
 * Format a YYYY-MM-DD date string into a friendly human-readable format.
 * Falls back to raw string if parsing fails.
 */
function formatOADate(dateStr) {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generates subject, HTML, and text versions of the OA reminder email.
 */
function generateOAReminderEmail({ userName, companyName, oaDate, oaTime }) {
  const safeName = userName || 'there';
  const safeCompany = companyName || 'Upcoming OA';
  const displayDate = formatOADate(oaDate);
  const displayTime = oaTime || 'Time not specified';

  const subject = `Reminder: ${safeCompany} OA is tomorrow`;

  const text = `PrepBoard — OA Reminder

Hi ${safeName},

Just a reminder that your Online Assessment for ${safeCompany} is scheduled for tomorrow.

• Company: ${safeCompany}
• Date: ${displayDate} (${oaDate})
• Time: ${displayTime}

Make sure you're prepared and ready. Good luck!

— PrepBoard`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #09090B; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAFA; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #E4E4E7; background-color: #FFFFFF;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 700; color: #18181B; letter-spacing: -0.5px;">PrepBoard</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; background-color: #EFF6FF; color: #2563EB; border-radius: 4px;">OA Reminder</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.5; color: #09090B;">
                Hi <strong>${safeName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: #52525B;">
                This is a quick reminder that your Online Assessment for <strong style="color: #18181B;">${safeCompany}</strong> is scheduled for tomorrow.
              </p>

              <!-- Highlighted OA Details Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 10px; font-size: 13px; font-weight: 600; color: #71717A; width: 90px; vertical-align: top;">Company</td>
                        <td style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #18181B; vertical-align: top;">${safeCompany}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; font-size: 13px; font-weight: 600; color: #71717A; vertical-align: top;">Date</td>
                        <td style="padding-bottom: 10px; font-size: 14px; color: #18181B; vertical-align: top;">${displayDate} <span style="color: #71717A; font-size: 13px;">(${oaDate})</span></td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; font-weight: 600; color: #71717A; vertical-align: top;">Time</td>
                        <td style="font-size: 14px; color: #18181B; vertical-align: top;">${displayTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #52525B;">
                Make sure you're well-rested, your setup is tested, and you're ready ahead of time.
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; font-weight: 600; color: #18181B;">
                Good luck!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FAFAFA; border-top: 1px solid #E4E4E7; font-size: 12px; color: #71717A; text-align: center;">
              Sent by <strong>PrepBoard</strong> — Track your job applications &amp; interview schedules seamlessly.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

module.exports = {
  generateOAReminderEmail,
  formatOADate,
};
