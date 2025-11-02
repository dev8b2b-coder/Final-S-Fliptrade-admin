// Email Service Helper
// Supports multiple email providers: SMTP, Resend, SendGrid

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Send email using SMTP (Nodemailer)
export async function sendEmailViaSMTP(options: EmailOptions): Promise<boolean> {
  const EMAIL_HOST = Deno.env.get('EMAIL_HOST');
  const EMAIL_PORT = Deno.env.get('EMAIL_PORT');
  const EMAIL_USER = Deno.env.get('EMAIL_USER');
  const EMAIL_PASSWORD = Deno.env.get('EMAIL_PASSWORD');
  
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
    console.log('SMTP credentials not configured - skipping SMTP email send');
    return false;
  }

  try {
    // Dynamic import of nodemailer
    const nodemailer = await import('npm:nodemailer@6.9.7');
    
    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT),
      secure: parseInt(EMAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Send email
    const info = await transporter.sendMail({
      from: options.from || `"Admin Panel" <${EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✅ Email sent successfully via SMTP to ${options.to}`);
    console.log(`Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('SMTP email sending error:', error);
    return false;
  }
}

// Send email using Resend API (Recommended - Simple & Reliable)
export async function sendEmailViaResend(options: EmailOptions): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured - skipping email send');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: options.from || 'Admin Panel <onboarding@resend.dev>', // Use verified domain in production
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    console.log(`Email sent successfully to ${options.to} via Resend`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Send email using SendGrid API
export async function sendEmailViaSendGrid(options: EmailOptions): Promise<boolean> {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  
  if (!SENDGRID_API_KEY) {
    console.log('SENDGRID_API_KEY not configured - skipping email send');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }],
        }],
        from: { 
          email: options.from || 'admin@yourdomain.com', // Must be verified sender
        },
        subject: options.subject,
        content: [{
          type: 'text/html',
          value: options.html,
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid API error:', error);
      return false;
    }

    console.log(`Email sent successfully to ${options.to} via SendGrid`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Welcome email template - Exact FlipTrade Group design
export function getWelcomeEmailHTML(name: string, email: string, temporaryPassword: string, loginUrl: string = 'https://admin.fliptradegroup.com'): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Fliptrade Group</title>
<style>
  body {
    margin: 0;
    background-color: #f1f3f6;
    font-family: 'Segoe UI', Arial, sans-serif;
  }

  .email-wrapper {
    width: 100%;
    padding: 40px 0;
    background-color: #f1f3f6;
  }

  .email-container {
    max-width: 620px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 12px;
    border: 1px solid #dcdcdc;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .header {
    background-color: #0b0f1a;
    text-align: center;
    padding: 35px 20px;
  }

  .header img {
    width: 200px;
    height: auto;
    background-color: #0b0f1a;
  }

  .content {
    padding: 35px 45px;
    color: #333;
  }

  .content h1 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #0b0f1a;
  }

  .content p {
    font-size: 15px;
    line-height: 1.6;
    color: #555;
  }

  .login-details {
    background-color: #fafafa;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    padding: 20px;
    margin: 25px 0;
  }

  .login-details p {
    font-size: 15px;
    margin: 8px 0;
  }

  .login-details strong {
    color: #000;
  }

  .btn {
    display: inline-block;
    background-color: #007bff;
    color: #ffffff !important;
    text-decoration: none;
    padding: 14px 30px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    margin-top: 10px;
  }

  .footer {
    text-align: center;
    background-color: #fafafa;
    border-top: 1px solid #e6e6e6;
    padding: 25px;
    font-size: 13px;
    color: #777;
  }

  .footer a {
    color: #007bff;
    text-decoration: none;
  }

  /* Optional: Dark mode support */
  @media (prefers-color-scheme: dark) {
    body {
      background-color: #0b0f1a;
    }
    .email-container {
      background-color: #1a1d26;
      border: 1px solid #333;
    }
    .content, .footer {
      color: #ddd;
    }
    .content h1 {
      color: #fff;
    }
    .login-details {
      background-color: #222630;
      border-color: #444;
    }
    .footer {
      background-color: #11141c;
      border-color: #222;
    }
    .header img {
      background-color: #0b0f1a;
    }
  }
</style>
</head>
<body>

<div class="email-wrapper">
  <div class="email-container">
    
    <!-- Header -->
    <div class="header">
      <img src="https://www.fliptradegroup.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FLogo.b7c8d1a7.webp&w=3840&q=75" alt="Fliptrade Logo">
    </div>

    <!-- Content -->
    <div class="content">
      <h1>Welcome to Fliptrade Group!</h1>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your staff account has been successfully created. You can now log in to the Fliptrade Admin Panel to start managing your tasks, track activities, and collaborate with your team.</p>

      <div class="login-details">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      </div>

      <a href="${loginUrl}" class="btn">Log In to Dashboard</a>

      <p style="margin-top:25px;">For security reasons, please change your password immediately after your first login.</p>

      <p>We're excited to have you on board!<br>– The Fliptrade Group Team</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:support@fliptradegroup.com">support@fliptradegroup.com</a> or call +41 2650 06818</p>
      <p>© 2025 Fliptrade Group. All rights reserved.</p>
    </div>

  </div>
</div>

</body>
</html>
  `.trim();
}

// OTP email template - Exact FlipTrade Group design with dynamic OTP
export function getOTPEmailHTML(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Reset - Fliptrade Group</title>
<style>
  body {
    margin: 0;
    background-color: #f1f3f6;
    font-family: 'Segoe UI', Arial, sans-serif;
  }

  .email-wrapper {
    width: 100%;
    padding: 40px 0;
    background-color: #f1f3f6;
  }

  .email-container {
    max-width: 620px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 12px;
    border: 1px solid #dcdcdc;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .header {
    background-color: #0b0f1a;
    text-align: center;
    padding: 35px 20px;
  }

  .header img {
    width: 200px;
    height: auto;
    background-color: #0b0f1a;
  }

  .content {
    padding: 35px 45px;
    color: #333;
  }

  .content h1 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #0b0f1a;
  }

  .content p {
    font-size: 15px;
    line-height: 1.6;
    color: #555;
  }

  .login-details {
    background-color: #fafafa;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    padding: 20px;
    margin: 25px 0;
    text-align: center;
  }

  .login-details p {
    font-size: 15px;
    margin: 8px 0;
  }

  .login-details strong {
    color: #000;
  }

  .otp-code {
    font-size: 36px;
    font-weight: 700;
    color: #007bff;
    letter-spacing: 8px;
    font-family: 'Monaco', 'Courier New', monospace;
    margin: 15px 0;
  }

  .btn {
    display: inline-block;
    background-color: #007bff;
    color: #ffffff !important;
    text-decoration: none;
    padding: 14px 30px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    margin-top: 10px;
  }

  .footer {
    text-align: center;
    background-color: #fafafa;
    border-top: 1px solid #e6e6e6;
    padding: 25px;
    font-size: 13px;
    color: #777;
  }

  .footer a {
    color: #007bff;
    text-decoration: none;
  }

  /* Optional: Dark mode support */
  @media (prefers-color-scheme: dark) {
    body {
      background-color: #0b0f1a;
    }
    .email-container {
      background-color: #1a1d26;
      border: 1px solid #333;
    }
    .content, .footer {
      color: #ddd;
    }
    .content h1 {
      color: #fff;
    }
    .login-details {
      background-color: #222630;
      border-color: #444;
    }
    .footer {
      background-color: #11141c;
      border-color: #222;
    }
    .header img {
      background-color: #0b0f1a;
    }
  }
</style>
</head>
<body>

<div class="email-wrapper">
  <div class="email-container">
    
    <!-- Header -->
    <div class="header">
      <img src="https://www.fliptradegroup.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FLogo.b7c8d1a7.webp&w=3840&q=75" alt="Fliptrade Logo">
    </div>

    <!-- Content -->
    <div class="content">
      <h1>Password Reset Request</h1>
      <p>Hi <strong>${name || 'User'}</strong>,</p>
      <p>We received a request to reset your password for your Fliptrade Admin Panel account. Use the verification code below to complete the password reset process.</p>

      <div class="login-details">
        <p><strong>Your Verification Code:</strong></p>
        <div class="otp-code">${otp}</div>
        <p style="color: #888; font-size: 13px; margin-top: 10px;">Valid for 5 minutes</p>
      </div>

      <p style="margin-top:25px;">For security reasons, please do not share this code with anyone. If you didn't request this password reset, please ignore this email or contact support immediately.</p>

      <p>We're here to help if you need assistance!<br>– The Fliptrade Group Team</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:support@fliptradegroup.com">support@fliptradegroup.com</a> or call +41 2650 06818</p>
      <p>© 2025 Fliptrade Group. All rights reserved.</p>
    </div>

  </div>
</div>

</body>
</html>
  `.trim();
}

// Main email sending function - tries configured providers in order
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Try SMTP first (if configured)
  if (Deno.env.get('EMAIL_HOST') && Deno.env.get('EMAIL_USER')) {
    const result = await sendEmailViaSMTP(options);
    if (result) return true;
    console.log('SMTP failed, trying other providers...');
  }
  
  // Try Resend
  if (Deno.env.get('RESEND_API_KEY')) {
    const result = await sendEmailViaResend(options);
    if (result) return true;
    console.log('Resend failed, trying other providers...');
  }
  
  // Fallback to SendGrid
  if (Deno.env.get('SENDGRID_API_KEY')) {
    return await sendEmailViaSendGrid(options);
  }
  
  console.log('No email service configured. Set EMAIL_HOST/EMAIL_USER (SMTP), RESEND_API_KEY, or SENDGRID_API_KEY environment variable.');
  return false;
}
