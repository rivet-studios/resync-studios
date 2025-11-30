// Resend email integration for RESYNC Studios
import { Resend } from 'resend';

let connectionSettings: any;

async function getResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  if (!connectionSettings) {
    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings || !connectionSettings.settings?.api_key) {
      throw new Error('Resend not connected');
    }
  }

  return {
    client: new Resend(connectionSettings.settings.api_key),
    fromEmail: connectionSettings.settings.from_email || 'noreply@resync.community'
  };
}

export async function sendSignupEmail(email: string, confirmLink: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: `RESYNC Studios <${fromEmail}>`,
      to: email,
      subject: 'Confirm your RESYNC Studios account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 28px;">RESYNC Studios</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Gaming Community Platform</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Welcome to RESYNC Studios!</h2>
            <p style="color: #666; line-height: 1.6;">
              Thanks for signing up. Click the button below to confirm your email and complete your account setup.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
              ">
                Confirm Email
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              Or copy and paste this link in your browser:<br/>
              ${confirmLink}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
              This link expires in 24 hours. If you didn't create this account, please ignore this email.
            </p>
          </div>
          <div style="background: #1a1a2e; color: #999; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">© 2025 RESYNC Studios. All rights reserved.</p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send signup email:', error);
    throw error;
  }
}

export async function sendLoginLinkEmail(email: string, loginLink: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: `RESYNC Studios <${fromEmail}>`,
      to: email,
      subject: 'Your RESYNC Studios login link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 28px;">RESYNC Studios</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Gaming Community Platform</p>
          </div>
          <div style="padding: 30px; background: #f5f5f5;">
            <h2 style="color: #1a1a2e; margin-top: 0;">Log in to RESYNC Studios</h2>
            <p style="color: #666; line-height: 1.6;">
              Click the button below to log in to your account. This link is unique and expires in 24 hours.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
              ">
                Log In
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              Or copy and paste this link in your browser:<br/>
              ${loginLink}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
              This link expires in 24 hours. If you didn't request this login link, please ignore this email.
            </p>
          </div>
          <div style="background: #1a1a2e; color: #999; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">© 2025 RESYNC Studios. All rights reserved.</p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send login email:', error);
    throw error;
  }
}
