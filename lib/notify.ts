// Notification architecture stub.
//
// Wire up real notifications by setting these environment variables and
// filling in the TODOs below. Until configured, notifications are simply
// logged server-side so nothing breaks and admins can still see everything
// in the Admin Dashboard.
//
// Email (e.g. via Resend, SendGrid, SMTP):
//   NOTIFY_EMAIL_ENABLED=true
//   NOTIFY_EMAIL_PROVIDER_API_KEY=...
//   NOTIFY_EMAIL_TO=owner@example.com
//
// WhatsApp (e.g. via WhatsApp Business Cloud API / Twilio):
//   NOTIFY_WHATSAPP_ENABLED=true
//   NOTIFY_WHATSAPP_PROVIDER_API_KEY=...
//   NOTIFY_WHATSAPP_TO=+91...

export type NotificationKind =
  | "ARENA_ENQUIRY"
  | "TRAINING_ENQUIRY"
  | "MACHINING_REQUEST"
  | "CONTACT_MESSAGE";

export async function notifyAdmin(kind: NotificationKind, referenceNo: string, summary: string) {
  const emailEnabled = process.env.NOTIFY_EMAIL_ENABLED === "true";
  const whatsappEnabled = process.env.NOTIFY_WHATSAPP_ENABLED === "true";

  if (!emailEnabled && !whatsappEnabled) {
    console.log(`[notify] ${kind} ${referenceNo}: ${summary} (no notification channel configured)`);
    return;
  }

  if (emailEnabled) {
    // TODO: integrate an email provider SDK here using NOTIFY_EMAIL_PROVIDER_API_KEY.
    console.log(`[notify:email] would send email for ${kind} ${referenceNo}`);
  }

  if (whatsappEnabled) {
    // TODO: integrate a WhatsApp provider SDK here using NOTIFY_WHATSAPP_PROVIDER_API_KEY.
    console.log(`[notify:whatsapp] would send WhatsApp message for ${kind} ${referenceNo}`);
  }
}
