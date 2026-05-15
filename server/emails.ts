const BASE_STYLES = `
  font-family: 'Inter', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #050505;
  color: #ffffff;
  padding: 40px;
  border-radius: 12px;
`;

function wrapper(content: string): string {
  return `<div style="${BASE_STYLES.trim()}">${content}</div>`;
}

function footer(url: string, expiry: string): string {
  return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="color: #71717a; font-size: 12px; margin: 0 0 8px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="color: #a1a1aa; font-size: 11px; word-break: break-all; margin: 0 0 16px;">
        ${url}
      </p>
      <p style="color: #52525b; font-size: 11px; margin: 0;">
        If you didn't request this, you can safely ignore this email. ${expiry}
      </p>
    </div>
  `;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export function passwordResetEmail(resetUrl: string): string {
  return wrapper(`
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Password Reset</h1>
    <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      You requested a password reset for your RIVET Studios account. Click the button below
      to set a new password. This link expires in <strong style="color: #ffffff;">1 hour</strong>.
    </p>
    <a href="${resetUrl}"
       style="display: inline-block; background: #18181B; color: #ffffff; padding: 12px 24px;
              border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;
              border: 1px solid #3f3f46;">
      Reset Password
    </a>
    ${footer(resetUrl, "This link will expire in 1 hour.")}
  `);
}

// ─── Magic Link / Sign-in ─────────────────────────────────────────────────────

export function magicLinkEmail(loginUrl: string): string {
  return wrapper(`
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Sign in to RIVET Studios</h1>
    <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      Click the button below to sign in to your account. This link expires in
      <strong style="color: #ffffff;">24 hours</strong> and can only be used once.
    </p>
    <a href="${loginUrl}"
       style="display: inline-block; background: #ffffff; color: #000000; padding: 12px 24px;
              border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
      Sign in
    </a>
    ${footer(loginUrl, "This link will expire in 24 hours and can only be used once.")}
  `);
}
