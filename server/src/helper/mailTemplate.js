const transporter = require("../config/nodemailerConfig");

async function sendEmail({
  from,
  to,
  subject,
  text,
  attachments,
  html,
  data,
  type = "general",
  cc,
}) {
  try {
    // Generate HTML based on email type
    let emailHTML = html;

    if (!emailHTML && data) {
      switch (type) {
        case "requisition":
          emailHTML = generateRequisitionEmailHTML(data);
          break;
        case "approval":
          emailHTML = generateApprovalEmailHTML(data);
          break;
        case "rejection":
          emailHTML = generateRejectionEmailHTML(data);
          break;
        case "outstanding":
          emailHTML = generateOutstandingEmailHTML(data);
          break;
        case "pending":
          emailHTML = generatePendingEmailHTML(data);
          break;
        default:
          emailHTML = generateDefaultEmailHTML(data, subject, text);
      }
    }

    const info = await transporter.sendMail({
      from: `"Syscodes Request System" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: to,
      cc: cc,
      subject: subject,
      text: text, // Fallback for email clients that don't support HTML
      html: emailHTML || generateSimpleHTML(subject, text),
      attachments: attachments,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
}

// Helper function for currency formatting
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

// Requisition Email Template
function generateRequisitionEmailHTML(data) {
  const {
    requisitionNumber = "N/A",
    requestedBy = "Unknown",
    department = "N/A",
    email = "",
    totalAmount = 0,
    category = "",
    location = "",
    items = [],
    itemCount = (items && items.length) || 0,
    urgency = "normal",
    title = "",
    routeId = "",
  } = data;

  const urgencyColors = {
    high: {
      bg: "#fee2e2",
      border: "#ef4444",
      text: "#991b1b",
      label: "HIGH PRIORITY",
    },
    normal: {
      bg: "#dbeafe",
      border: "#3b82f6",
      text: "#1e3a8a",
      label: "NORMAL",
    },
    low: {
      bg: "#d1fae5",
      border: "#10b981",
      text: "#065f46",
      label: "LOW PRIORITY",
    },
  };

  const urgencyColor = urgencyColors[urgency] || urgencyColors.normal;

  // Build items table HTML (if items provided)
  let itemsTableHTML = "";
  if (items && items.length) {
    const rows = items
      .map((item) => {
        const name = item.description || item.name || item.item || "";
        const qty = item.quantity ?? item.qty ?? "";
        const unit = item.unitPrice ?? item.price ?? "";
        const total =
          item.total ??
          (typeof unit === "number" && typeof qty === "number"
            ? unit * qty
            : (item.total ?? ""));
        return `
                <tr>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151;">${name}</td>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151; text-align: center;">${qty}</td>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151; text-align: right;">${unit !== "" ? formatCurrency(unit) : ""}</td>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #111827; font-weight: 600; text-align: right;">${total !== "" && !isNaN(total) ? formatCurrency(total) : total}</td>
                </tr>
        `;
      })
      .join("");

    itemsTableHTML = `
              <!-- Items Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th align="left" style="padding: 10px; font-size: 13px; color: #6b7280; text-align: left;">Item</th>
                    <th align="center" style="padding: 10px; font-size: 13px; color: #6b7280;">Qty</th>
                    <th align="right" style="padding: 10px; font-size: 13px; color: #6b7280;">Unit</th>
                    <th align="right" style="padding: 10px; font-size: 13px; color: #6b7280;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Requisition - ${requisitionNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 0 20px;">
        
        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <!-- Urgency Banner (if high priority) -->
          ${
            urgency === "high"
              ? `
          <tr>
            <td style="background: #fee2e2; padding: 12px 24px; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600;">
                ⚠️ HIGH PRIORITY - Immediate attention required
              </p>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 24px; color: #374151;">

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
                A new request has been submitted and is pending your review.
              </p>

              <!-- Requisition Number Highlight -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: ${urgencyColor.bg}; border-left: 4px solid ${urgencyColor.border}; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px 0; color: ${urgencyColor.text}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Requisition Number
                    </p>
                    <p style="margin: 0; color: ${urgencyColor.text}; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">
                      ${requisitionNumber}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Details Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px;">
                    <h3 style="margin: 0; color: #111827; font-size: 16px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                      Request Details
                    </h3>
                  </td>
                </tr>

                ${
                  title
                    ? `
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 40%;">
                    <strong>Title:</strong>
                  </td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500;">
                    ${title}
                  </td>
                </tr>
                `
                    : ""
                }

                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 40%;">
                    <strong>Requested By:</strong>
                  </td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500;">
                    ${requestedBy}
                  </td>
                </tr>

                ${
                  department
                    ? `
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">
                    <strong>Department:</strong>
                  </td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500;">
                    ${department}
                  </td>
                </tr>
                `
                    : ""
                }

                ${
                  email
                    ? `
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">
                    <strong>Email:</strong>
                  </td>
                  <td style="padding: 10px 0;">
                    <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-size: 14px;">
                      ${email}
                    </a>
                  </td>
                </tr>
                `
                    : ""
                }

                ${
                  category
                    ? `
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">
                    <strong>Category:</strong>
                  </td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500;">
                    ${category}
                  </td>
                </tr>
                `
                    : ""
                }

                ${
                  location
                    ? `
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">
                    <strong>Location:</strong>
                  </td>
                  <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500;">
                    ${location}
                  </td>
                </tr>
                `
                    : ""
                }

                ${
                  totalAmount > 0
                    ? `
                <tr style="background: #f9fafb;">
                  <td style="padding: 12px 0; color: #374151; font-size: 14px; border-top: 2px solid #e5e7eb;">
                    <strong>Total Amount:</strong>
                  </td>
                  <td style="padding: 12px 0; color: #2563eb; font-size: 18px; font-weight: 700; border-top: 2px solid #e5e7eb;">
                    ${formatCurrency(totalAmount)}
                  </td>
                </tr>
                `
                    : ""
                }
              </table>

              ${itemsTableHTML}

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                      <a href="${process.env.APP_URL || "#"}/internal-requisitions/request/${routeId}" 
                        style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                      View Requisition
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                Syscodes Operations App
              </p>
              <p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 11px;">
                Automated notification • Do not reply to this email
              </p>
              <p style="margin: 0; color: #d1d5db; font-size: 10px;">
                © ${new Date().getFullYear()} Syscodes Communications. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        
        <!-- Email Client Support Text -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; margin-top: 16px;">
          <tr>
            <td style="text-align: center; padding: 0 20px;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${process.env.APP_URL || "#"}/internal-requisitions/request/${routeId}" style="color: #6b7280; word-break: break-all;">
                  ${process.env.APP_URL || "your-app-url"}/internal-requisitions/request/${routeId}
                </a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

// Simple fallback template
function generateSimpleHTML(subject, text) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: #1f2937; padding: 20px; color: white; text-align: center;">
              <h2 style="margin: 0;">${subject}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; color: #374151;">
              <p style="margin: 0; line-height: 1.6;">${text}</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
              Syscodes Operations App
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Default template for general emails
function generateDefaultEmailHTML(data, subject, text) {
  return generateSimpleHTML(subject, text);
}

// Approval Email Template
function generateApprovalEmailHTML(data) {
  const {
    requisitionNumber = "N/A",
    approvedBy = {},
    totalAmount = 0,
    comment = "",
    routeId = "",
  } = data || {};

  const approverName =
    (approvedBy && (approvedBy.name || approvedBy)) || "Finance Team";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Requisition Approved - ${requisitionNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#10b981;padding:20px;color:#fff;text-align:center;">
              <h2 style="margin:0;font-size:18px;">✓ Requisition Approved</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:#374151;">
              <p style="margin:0 0 16px 0;">Good news — your requisition <strong>${requisitionNumber}</strong> has been approved by <strong>${approverName}</strong>.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 18px 0;">
                <tr>
                  <td style="color:#6b7280;padding:6px 0;width:40%;">Requisition Number:</td>
                  <td style="padding:6px 0;color:#111827;font-weight:600;">${requisitionNumber}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;padding:6px 0;">Approved By:</td>
                  <td style="padding:6px 0;color:#111827;font-weight:600;">${approverName}</td>
                </tr>
                ${
                  totalAmount > 0
                    ? `
                <tr>
                  <td style="color:#6b7280;padding:6px 0;">Total Amount:</td>
                  <td style="padding:6px 0;color:#111827;font-weight:600;">${formatCurrency(totalAmount)}</td>
                </tr>`
                    : ""
                }
                ${
                  comment
                    ? `
                <tr>
                  <td style="color:#6b7280;padding:6px 0;vertical-align:top;">Comment:</td>
                  <td style="padding:6px 0;color:#111827;">${comment}</td>
                </tr>`
                    : ""
                }
              </table>

              <p style="margin:0 0 20px 0;">You can view the requisition details by clicking the button below.</p>

              <p style="text-align:center;margin:0;">
                <a href="${process.env.APP_URL || "#"}/internal-requisitions/request/${routeId}" style="display:inline-block;padding:12px 22px;background:#0f766e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">View Requisition</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:14px;text-align:center;color:#6b7280;font-size:12px;">Syscodes Operations App • Automated notification</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Rejection Email Template
function generateRejectionEmailHTML(data) {
  const {
    requisitionNumber = "N/A",
    rejectedBy = {},
    comment = "",
    routeId = "",
  } = data || {};

  const rejector =
    (rejectedBy && (rejectedBy.name || rejectedBy)) || "Finance Team";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Requisition Rejected - ${requisitionNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#fee2e2;padding:20px;color:#991b1b;text-align:center;">
              <h2 style="margin:0;font-size:18px;">✗ Requisition Rejected</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:#374151;">
              <p style="margin:0 0 16px 0;">We're sorry — your requisition <strong>${requisitionNumber}</strong> was rejected by <strong>${rejector}</strong>.</p>

              ${comment ? `<p style="margin:0 0 16px 0;color:#6b7280;">Reason: ${comment}</p>` : ""}

              <p style="margin:0 0 20px 0;">If you need further details, please review the requisition or contact the finance team.</p>

              <p style="text-align:center;margin:0;">
                <a href="${process.env.APP_URL || "#"}/internal-requisitions/request/${routeId}" style="display:inline-block;padding:12px 22px;background:#ef4444;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">View Requisition</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:14px;text-align:center;color:#6b7280;font-size:12px;">Syscodes Operations App • Automated notification</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Outstanding Email Template - NEW
function generateOutstandingEmailHTML(data) {
  const {
    requisitionNumber = "N/A",
    updatedBy = {},
    totalAmount = 0,
    outstandingAmount = 0,
    paidAmount = 0,
    comment = "",
    routeId = "",
    paymentHistory = [],
  } = data || {};

  const updater =
    (updatedBy && (updatedBy.name || updatedBy)) || "Finance Team";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Requisition Outstanding - ${requisitionNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#fef3c7;padding:20px;color:#92400e;text-align:center;">
              <h2 style="margin:0;font-size:18px;">⏳ Requisition Partially Paid (Outstanding)</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:#374151;">
              <p style="margin:0 0 16px 0;">Your requisition <strong>${requisitionNumber}</strong> has been partially processed by <strong>${updater}</strong>.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 18px 0;background:#fffbeb;border-left:4px solid #f59e0b;padding:12px;">
                <tr>
                  <td style="color:#92400e;padding:6px 0;width:40%;">Requisition Number:</td>
                  <td style="padding:6px 0;color:#78350f;font-weight:600;">${requisitionNumber}</td>
                </tr>
                <tr>
                  <td style="color:#92400e;padding:6px 0;">Total Amount:</td>
                  <td style="padding:6px 0;color:#78350f;font-weight:600;">${formatCurrency(totalAmount)}</td>
                </tr>
                <tr>
                  <td style="color:#92400e;padding:6px 0;">Amount Paid:</td>
                  <td style="padding:6px 0;color:#059669;font-weight:600;">${formatCurrency(paidAmount)}</td>
                </tr>
                <tr>
                  <td style="color:#92400e;padding:6px 0;">Outstanding Balance:</td>
                  <td style="padding:6px 0;color:#dc2626;font-weight:600;font-size:16px;">${formatCurrency(outstandingAmount)}</td>
                </tr>
              </table>

              ${
                comment
                  ? `
              <div style="background:#f3f4f6;border-left:3px solid #6b7280;padding:12px;margin:16px 0;">
                <p style="margin:0;color:#4b5563;font-size:13px;"><strong>Note:</strong> ${comment}</p>
              </div>`
                  : ""
              }

              ${
                paymentHistory && paymentHistory.length > 0
                  ? `
              <div style="margin:16px 0;">
                <h3 style="margin:0 0 8px 0;color:#111827;font-size:14px;font-weight:600;">Payment History:</h3>
                ${paymentHistory
                  .map(
                    (payment) => `
                  <div style="background:#f9fafb;padding:10px;margin:6px 0;border-radius:4px;">
                    <p style="margin:0;color:#374151;font-size:13px;">
                      <strong>${formatCurrency(payment.amount)}</strong> 
                      paid via ${payment.paymentMethod || payment.bank || "N/A"} 
                      by ${payment.paidBy || "Finance"} 
                      ${payment.date ? `on ${new Date(payment.date).toLocaleDateString()}` : ""}
                    </p>
                    ${payment.comment ? `<p style="margin:4px 0 0 0;color:#6b7280;font-size:12px;">${payment.comment}</p>` : ""}
                  </div>
                `,
                  )
                  .join("")}
              </div>`
                  : ""
              }

              <p style="margin:20px 0;">The outstanding balance will be processed separately. You'll be notified once the full payment is complete.</p>

              <p style="text-align:center;margin:0;">
                <a href="${process.env.APP_URL || "#"}/internal-requisitions/request/${routeId}" style="display:inline-block;padding:12px 22px;background:#f59e0b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">View Requisition Details</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:14px;text-align:center;color:#6b7280;font-size:12px;">Syscodes Operations App • Automated notification</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Pending Email Template - NEW
function generatePendingEmailHTML(data) {
  const {
    requisitionNumber = "N/A",
    requestedBy = "Unknown",
    department = "N/A",
    totalAmount = 0,
    comment = "",
    routeId = "",
    daysPending = 0,
  } = data || {};

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Requisition Pending - ${requisitionNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#dbeafe;padding:20px;color:#1e40af;text-align:center;">
              <h2 style="margin:0;font-size:18px;">⏱️ Requisition Status: Pending Review</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:#374151;">
              <p style="margin:0 0 16px 0;">The requisition <strong>${requisitionNumber}</strong> is currently pending review by the Finance team.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 18px 0;">
                <tr>
                  <td style="color:#6b7280;padding:6px 0;width:40%;">Requisition Number:</td>
                  <td style="padding:6px 0;color:#111827;font-weight:600;">${requisitionNumber}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;padding:6px 0;">Requested By:</td>
                  <td style="padding:6px 0;color:#111827;font-weight:600;">${requestedBy}</td>
                </tr>
                ${
                  department
                    ? `
                <tr>
                  <td style="color:#6b7280;padding:6px 0;">Department:</td>
                  <td style="padding:6px 0;color:#111827;font-weight:600;">${department}</td>
                </tr>`
                    : ""
                }
                ${
                  totalAmount > 0
                    ? `
                <tr>
                  <td style="color:#6b7280;padding:6px 0;">Total Amount:</td>
                  <td style="padding:6px 0;color:#111827;font-weight:600;">${formatCurrency(totalAmount)}</td>
                </tr>`
                    : ""
                }
                ${
                  daysPending > 0
                    ? `
                <tr>
                  <td style="color:#6b7280;padding:6px 0;">Days Pending:</td>
                  <td style="padding:6px 0;color:#dc2626;font-weight:600;">${daysPending} ${daysPending === 1 ? "day" : "days"}</td>
                </tr>`
                    : ""
                }
              </table>

              ${
                comment
                  ? `
              <div style="background:#f0f9ff;border-left:3px solid #3b82f6;padding:12px;margin:16px 0;">
                <p style="margin:0;color:#1e40af;font-size:13px;"><strong>Note:</strong> ${comment}</p>
              </div>`
                  : ""
              }

              <p style="margin:20px 0;">Your request is being reviewed. You will receive an email notification once a decision has been made.</p>

              <p style="text-align:center;margin:0;">
                <a href="${process.env.APP_URL || "#"}/internal-requisitions/request/${routeId}" style="display:inline-block;padding:12px 22px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">View Requisition</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:14px;text-align:center;color:#6b7280;font-size:12px;">Syscodes Operations App • Automated notification</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = sendEmail;
