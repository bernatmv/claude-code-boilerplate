type WelcomeProps = { appName: string; signInUrl: string };
type SubscriptionProps = { appName: string; manageUrl: string };

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<h1 style="font-size:20px;font-weight:600;margin:0 0 16px">${title}</h1>
${body}
<p style="font-size:12px;color:#666;margin-top:32px">Sent automatically — do not reply.</p>
</body></html>`;
}

export function welcomeEmail({ appName, signInUrl }: WelcomeProps): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Welcome to ${appName}`;
  const html = layout(
    subject,
    `<p>Thanks for signing up. Confirm your email from the link we just sent, then sign in:</p>
<p><a href="${signInUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:6px;text-decoration:none">Sign in</a></p>`,
  );
  const text = `Welcome to ${appName}\n\nConfirm your email from the link we just sent, then sign in: ${signInUrl}`;
  return { subject, html, text };
}

export function subscriptionActivatedEmail({ appName, manageUrl }: SubscriptionProps): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Your ${appName} subscription is active`;
  const html = layout(
    subject,
    `<p>Your subscription is now active. You can manage billing any time:</p>
<p><a href="${manageUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:6px;text-decoration:none">Manage billing</a></p>`,
  );
  const text = `Your ${appName} subscription is active.\n\nManage billing: ${manageUrl}`;
  return { subject, html, text };
}
