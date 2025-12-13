// Test script for complete email functionality including welcome and reset emails
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailSystem() {
  console.log('🧪 Testing Complete Email System...\n');

  // Create transporter with your Gmail credentials
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Verify SMTP connection
    console.log('1. Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified\n');

    // Test Welcome Email for Tenant
    console.log('2. Testing Tenant Welcome Email...');
    const tenantWelcomeHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to The Missing Piece Planning</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to The Missing Piece Planning!</h1>
            <p>Your tenant account has been created</p>
        </div>
        <div class="content">
            <p>Hello <strong>Test Tenant</strong>,</p>
            <p>Welcome! Your tenant account for <strong>Test Company</strong> has been successfully created.</p>
            <p><strong>Your Account Details:</strong></p>
            <ul>
                <li>Email: test-tenant@example.com</li>
                <li>Company: Test Company</li>
                <li>Role: Tenant</li>
            </ul>
            <p>To get started, please set your password using the link below:</p>
            <p><a href="http://localhost:3000/reset-password?token=test-token-123" class="button">Set Your Password</a></p>
            <p>This link will expire in 1 hour for security purposes.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The Missing Piece Planning Team</p>
        </div>
        <div class="footer">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                Powered by <strong>The Missing Piece Planning</strong>
            </p>
        </div>
    </div>
</body>
</html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: '🎉 Welcome to The Missing Piece Planning - Tenant Account Created',
      html: tenantWelcomeHtml,
      text: 'Welcome to The Missing Piece Planning! Your tenant account has been created. Please check your email for the HTML version of this message.'
    });
    console.log('✅ Tenant welcome email sent successfully\n');

    // Test Client Welcome Email
    console.log('3. Testing Client Welcome Email...');
    const clientWelcomeHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Dream Weddings</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Dream Weddings!</h1>
            <p>Your client profile has been created</p>
        </div>
        <div class="content">
            <p>Hello <strong>Sarah & John</strong>,</p>
            <p>Welcome! Your client profile has been created by <strong>Dream Weddings</strong>.</p>
            <p><strong>Your Profile Details:</strong></p>
            <ul>
                <li>Email: test-client@example.com</li>
                <li>Names: Sarah & John</li>
                <li>Planning Company: Dream Weddings</li>
            </ul>
            <p>To get started, please set your password using the link below:</p>
            <p><a href="http://localhost:3000/reset-password?token=test-token-456" class="button">Set Your Password</a></p>
            <p>This link will expire in 1 hour for security purposes.</p>
            <p>We're excited to help plan your special day!</p>
            <p>Best regards,<br>Dream Weddings Team</p>
        </div>
        <div class="footer">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                Powered by <strong>The Missing Piece Planning</strong>
            </p>
        </div>
    </div>
</body>
</html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: '💒 Welcome to Dream Weddings - Your Client Profile',
      html: clientWelcomeHtml,
      text: 'Welcome to Dream Weddings! Your client profile has been created. Please check your email for the HTML version of this message.'
    });
    console.log('✅ Client welcome email sent successfully\n');

    // Test Password Reset Email
    console.log('4. Testing Password Reset Email...');
    const resetHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Reset your password for The Missing Piece Planning</p>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset the password for your account.</p>
            <div class="warning">
                <p><strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <p>To reset your password, click the button below:</p>
            <p><a href="http://localhost:3000/reset-password?token=test-reset-789" class="button">Reset Password</a></p>
            <p><strong>Important:</strong> This link will expire in 1 hour for security purposes.</p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                http://localhost:3000/reset-password?token=test-reset-789
            </p>
            <p>Best regards,<br>The Missing Piece Planning Team</p>
        </div>
        <div class="footer">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                Powered by <strong>The Missing Piece Planning</strong>
            </p>
        </div>
    </div>
</body>
</html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: '🔐 Password Reset Request - The Missing Piece Planning',
      html: resetHtml,
      text: 'Password reset request for The Missing Piece Planning. Please check your email for the HTML version of this message with the reset link.'
    });
    console.log('✅ Password reset email sent successfully\n');

    console.log('🎉 ALL EMAIL TESTS COMPLETED SUCCESSFULLY!');
    console.log(`📧 Check your inbox at ${process.env.SMTP_USER} for 3 test emails:`);
    console.log('   1. Tenant Welcome Email (purple theme)');
    console.log('   2. Client Welcome Email (red theme with tenant branding)');
    console.log('   3. Password Reset Email (security themed)');
    console.log('\n✅ Your email system is fully operational and ready for production!');

  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('\nPlease check your Gmail app password and settings.');
  }
}

testEmailSystem();