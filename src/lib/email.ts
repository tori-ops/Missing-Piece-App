import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.GMAIL_PASS,
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.log('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

// Helper function to build correct URLs for email links
function getBaseUrl(): string {
  // Priority order: NEXTAUTH_URL > VERCEL_URL > localhost
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (process.env.VERCEL_URL) {
    // Vercel automatically sets VERCEL_URL but needs https prefix
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development fallback
  return 'http://localhost:3000';
}

function buildResetLink(token: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/reset-password?token=${token}`;
}

function buildPortalLink(): string {
  return getBaseUrl();
}

interface WelcomeEmailData {
  recipientEmail: string;
  recipientName: string;
  role: 'TENANT' | 'CLIENT';
  resetToken: string;
  businessName?: string; // For tenant emails
  tenantBusinessName?: string; // For client emails
  tenantBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    secondaryColorOpacity?: number;
    fontColor?: string;
    companyName?: string;
    tagline?: string;
    logoUrl?: string;
  }; // For client emails with tenant branding
}

// Utility function for sophisticated first name extraction
function extractFirstName(fullName: string): string {
  if (!fullName?.trim()) return 'there';
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return 'there';
  
  // Handle edge cases like "Mary Jane Smith" - take first part as first name
  const firstName = parts[0];
  
  // Basic validation to ensure we don't return empty or very short names
  if (firstName && firstName.length >= 1) {
    return firstName;
  }
  
  return 'there';
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const resetLink = buildResetLink(data.resetToken);
    const portalLink = buildPortalLink();
    
    let subject: string;
    let htmlContent: string;
    
    if (data.role === 'TENANT') {
      subject = `Welcome to The Missing Piece - Your Business Account is Ready!`;
      htmlContent = generateTenantWelcomeEmail(data, resetLink, portalLink);
    } else {
      subject = `Welcome to ${data.tenantBusinessName} - Your Wedding Planning Portal is Ready!`;
      htmlContent = generateClientWelcomeEmail(data, resetLink, portalLink);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'The Missing Piece <noreply@missingpiece.com>',
      to: data.recipientEmail,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('   Reset Link:', resetLink);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function generateTenantWelcomeEmail(data: WelcomeEmailData, resetLink: string, portalLink: string): string {
  const firstName = extractFirstName(data.recipientName);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Missing Piece Planning</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 20px; 
      background-color: #f8f9fa;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #fff; 
      border-radius: 10px; 
      overflow: hidden; 
      box-shadow: 0 0 20px rgba(0,0,0,0.1); 
    }
    .header { 
      background: linear-gradient(135deg, #274E13 0%, #3D7A1A 100%); 
      color: white; 
      padding: 30px; 
      text-align: center; 
    }
    .content { 
      padding: 30px; 
    }
    .button { 
      display: inline-block; 
      background: #274E13; 
      color: rgba(208, 206, 181, 0.35); 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 5px; 
      margin: 20px 0; 
      font-weight: bold;
    }
    .footer { 
      background: #f8f9fa; 
      padding: 20px; 
      text-align: center; 
      border-top: 1px solid #eee; 
    }
    .highlight { 
      background: #E8F5E8; 
      padding: 20px; 
      border-left: 4px solid #274E13; 
      margin: 20px 0; 
      border-radius: 5px;
    }
    .features { 
      background: #f8f9fa; 
      padding: 20px; 
      border-radius: 5px; 
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to The Missing Piece Planning!</h1>
      <p>Your business management platform is ready</p>
    </div>
    
    <div class="content">
      <p>Hey, <strong>${firstName}</strong>!</p>
      
      <p>Congratulations! Your business account for <strong>${data.businessName}</strong> has been successfully created on The Missing Piece platform.</p>
      
      <div class="highlight">
        <h3>🔐 Set Your Password</h3>
        <p>To secure your account and start using your dashboard, please click the button below to set your password:</p>
        <p><a href="${resetLink}" class="button">Set My Password</a></p>
        <p><small><em>⏰ This link expires in 1 hour for security purposes.</em></small></p>
      </div>
      
      <div class="features">
        <h3>🚀 What You Can Do Next:</h3>
        <ul>
          <li><strong>🎨 Customize Your Brand:</strong> Set up your business colors, fonts, and logo</li>
          <li><strong>💑 Create Client Profiles:</strong> Add your wedding couples to the platform</li>
          <li><strong>📊 Manage Your Dashboard:</strong> Track clients, payments, and business metrics</li>
          <li><strong>🤝 Collaborate Safely:</strong> Each client gets their own branded portal</li>
          <li><strong>📧 Automated Communications:</strong> Welcome emails are sent automatically to new clients</li>
        </ul>
      </div>
      
      <h3>📧 Your Login Details:</h3>
      <p><strong>Email:</strong> ${data.recipientEmail}<br>
      <strong>Portal:</strong> <a href="${portalLink}">${portalLink}</a></p>
      
      <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
      
      <p>Welcome to the future of wedding planning!</p>
      
      <p>Best regards,<br>
      <strong>The Missing Piece Planning Team</strong></p>
    </div>
    
    <div class="footer">
      <p style="margin: 0; color: #6c757d; font-size: 14px;">
        Powered by <strong>The Missing Piece Planning</strong>
      </p>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">
        © 2025 The Missing Piece Planning. All rights reserved.<br>
        If you didn't create this account, please ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function generateClientWelcomeEmail(data: WelcomeEmailData, resetLink: string, portalLink: string): string {
  const firstName = extractFirstName(data.recipientName);
  const branding = data.tenantBranding;
  
  // Use tenant branding if available, fallback to default
  const primaryColor = branding?.primaryColor || '#667eea';
  const secondaryColor = branding?.secondaryColor || '#764ba2';
  const fontColor = branding?.fontColor || '#ffffff';
  const companyName = branding?.companyName || data.tenantBusinessName || 'Your Wedding Planner';
  const logoSection = branding?.logoUrl ? 
    `<img src="${branding.logoUrl}" alt="${companyName} Logo" style="max-height: 60px; margin-bottom: 10px;">` : 
    '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${companyName}'s Planning Portal</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 20px; 
      background-color: #f8f9fa;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #fff; 
      border-radius: 10px; 
      overflow: hidden; 
      box-shadow: 0 0 20px rgba(0,0,0,0.1); 
    }
    .header { 
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); 
      color: ${fontColor}; 
      padding: 30px; 
      text-align: center; 
    }
    .content { 
      padding: 30px; 
    }
    .button { 
      display: inline-block; 
      background: ${primaryColor}; 
      color: white; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 5px; 
      margin: 20px 0; 
      font-weight: bold;
    }
    .footer { 
      background: #f8f9fa; 
      padding: 20px; 
      text-align: center; 
      border-top: 1px solid #eee; 
    }
    .highlight { 
      background: rgba(${primaryColor.substring(1)}, 0.1); 
      padding: 20px; 
      border-left: 4px solid ${primaryColor}; 
      margin: 20px 0; 
      border-radius: 5px;
    }
    .features { 
      background: #f8f9fa; 
      padding: 20px; 
      border-radius: 5px; 
      margin: 20px 0;
    }
    .vendor-note { 
      background: rgba(${secondaryColor.substring(1)}, 0.1); 
      padding: 20px; 
      border-left: 4px solid ${secondaryColor}; 
      margin: 20px 0; 
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoSection}
      <h1>💍 Welcome to ${companyName}'s planning app, ${firstName}!</h1>
      <p>Your personalized wedding planning portal is ready</p>
    </div>
    
    <div class="content">
      <p>Hey, <strong>${firstName}</strong>!</p>
      
      <p>Congratulations on your upcoming wedding! 🎉</p>
      
      <p><strong>${companyName}</strong> has created a personalized wedding planning portal just for you. This secure space will help you organize every detail of your special day.</p>
      
      <div class="highlight">
        <h3>🔐 Access Your Portal</h3>
        <p>To get started, please click the button below to set your password:</p>
        <p><a href="${resetLink}" class="button">Access My Wedding Portal</a></p>
        <p><small><em>⏰ This link expires in 1 hour for security purposes.</em></small></p>
      </div>
      
      <div class="features">
        <h3>✨ Your Wedding Planning Tools:</h3>
        <ul>
          <li><strong>📋 Planning Checklist:</strong> Track every detail with our comprehensive timeline</li>
          <li><strong>👥 Guest Management:</strong> Manage your guest list and RSVPs</li>
          <li><strong>💐 Vendor Coordination:</strong> Stay connected with all your wedding vendors</li>
          <li><strong>📅 Timeline & Tasks:</strong> Never miss an important deadline</li>
          <li><strong>💰 Budget Tracking:</strong> Keep your wedding finances on track</li>
        </ul>
      </div>
      
      <div class="vendor-note">
        <h3>👍 Working with ${companyName}</h3>
        <p>Your wedding planning team can see your progress and will be notified of updates. This helps them provide you with the best possible service throughout your wedding journey.</p>
      </div>
      
      <h3>📧 Your Login Details:</h3>
      <p><strong>Email:</strong> ${data.recipientEmail}<br>
      <strong>Portal:</strong> <a href="${portalLink}">${portalLink}</a></p>
      
      <p>We're excited to be part of your wedding journey!</p>
      
      <p>With love and best wishes,<br>
      <strong>${companyName}</strong></p>
    </div>
    
    <div class="footer">
      <p style="margin: 0; color: #6c757d; font-size: 14px;">
        Powered by <strong>The Missing Piece Planning</strong>
      </p>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">
        This portal was created for you by ${companyName}.<br>
        If you believe you received this email in error, please contact ${companyName} directly.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendPasswordResetEmail(recipientEmail: string, resetToken: string, recipientName: string) {
  try {
    const resetLink = buildResetLink(resetToken);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'The Missing Piece <noreply@missingpiece.com>',
      to: recipientEmail,
      subject: 'Reset Your Password - The Missing Piece',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #274E13; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { display: inline-block; background: #274E13; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .warning { background: #FEF2F2; color: #DC2626; padding: 15px; border-left: 4px solid #DC2626; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    
    <div class="content">
      <h2>Hello ${recipientName},</h2>
      
      <p>You've requested to reset your password for your Missing Piece account.</p>
      
      <p>Click the button below to create a new password:</p>
      
      <a href="${resetLink}" class="button">Reset My Password</a>
      
      <div class="warning">
        <h3>⏰ Important Security Information:</h3>
        <ul>
          <li>This link expires in <strong>1 hour</strong></li>
          <li>If you didn't request this reset, ignore this email</li>
          <li>Your current password remains unchanged until you complete the reset</li>
        </ul>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
      
      <p>Best regards,<br>
      <strong>The Missing Piece Security Team</strong></p>
    </div>
    
    <div class="footer">
      <p>© 2025 The Missing Piece. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}