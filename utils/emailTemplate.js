const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatSections = (sections = []) =>
  sections
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding: 10px 0; color: #94a3b8; font-size: 13px; width: 150px; vertical-align: top;">${escapeHtml(label)}</td>
          <td style="padding: 10px 0; color: #e2e8f0; font-size: 14px; font-weight: 600;">${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join("");

const buildEmailTemplate = ({
  title,
  subtitle,
  intro,
  sections = [],
  actionText,
  actionUrl,
  footerNote = "This is an automated email from Smart Hostel Management.",
}) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#0b1120;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1120;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background:linear-gradient(135deg,#4f46e5,#7c3aed);">
                <div style="font-size:12px;color:#e0e7ff;letter-spacing:1.2px;font-weight:700;text-transform:uppercase;">Smart Hostel Management</div>
                <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">${escapeHtml(title)}</h1>
                ${
                  subtitle
                    ? `<p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;line-height:1.5;">${escapeHtml(subtitle)}</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;">
                ${
                  intro
                    ? `<p style="margin:0 0 18px;color:#cbd5e1;font-size:15px;line-height:1.7;">${escapeHtml(intro)}</p>`
                    : ""
                }
                ${
                  sections.length
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:4px 16px;">${formatSections(
                        sections
                      )}</table>`
                    : ""
                }
                ${
                  actionText && actionUrl
                    ? `<div style="margin-top:24px;"><a href="${actionUrl}" style="display:inline-block;padding:12px 18px;background:#22c55e;color:#052e16;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;">${escapeHtml(
                        actionText
                      )}</a></div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px;border-top:1px solid #1f2937;color:#64748b;font-size:12px;line-height:1.6;">
                ${escapeHtml(footerNote)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports = { buildEmailTemplate };
