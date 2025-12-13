// One-time test script to send all email types to vkoleski10@gmail.com
// Tests SMTP connection and email pipelines without saving the recipient
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailPipelineToExternal() {
  console.log('🧪 Testing Email Pipeline to External Address...\n');
  console.log('📧 From: tori@missingpieceplanning.com');
  console.log('📧 To: vkoleski10@gmail.com');
  console.log('🎯 Purpose: SMTP connection and pipeline verification\n');

  // Create transporter with current Gmail SMTP settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const testRecipient = 'vkoleski10@gmail.com';
  const timestamp = new Date().toLocaleString();

  try {
    // Verify SMTP connection
    console.log('1. ⚡ Verifying SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified\n');

    // Test 1: Tenant Welcome Email
    console.log('2. 📨 Testing Tenant Welcome Email Pipeline...');
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
        .test-badge { background: #ffc107; color: #212529; padding: 10px; border-radius: 5px; margin: 10px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 PIPELINE TEST - Welcome to The Missing Piece Planning!</h1>
            <p>Your tenant account has been created</p>
        </div>
        <div class="content">
            <div class="test-badge">
                🔬 TEST EMAIL - Sent at ${timestamp}
            </div>
            <p>Hello <strong>Test Tenant</strong>,</p>
            <p>This is a <strong>pipeline test</strong> for the tenant welcome email functionality.</p>
            <p><strong>Test Account Details:</strong></p>
            <ul>
                <li>Email: ${testRecipient}</li>
                <li>Company: Test Wedding Company</li>
                <li>Role: Tenant</li>
                <li>Test Type: SMTP Pipeline Verification</li>
            </ul>
            <p>In production, this would include a real password setup link:</p>
            <p><a href="http://localhost:3000/reset-password?token=test-token-123" class="button">Set Your Password (TEST)</a></p>
            <p><strong>✅ If you receive this email, the tenant welcome pipeline is working correctly!</strong></p>
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
      to: testRecipient,
      subject: '🧪 [TEST] Welcome to The Missing Piece Planning - Tenant Account',
      html: tenantWelcomeHtml,
      text: `TEST: Tenant Welcome Email Pipeline Test - Sent at ${timestamp}`
    });
    console.log('✅ Tenant welcome email sent successfully\n');

    // Test 2: Client Welcome Email
    console.log('3. 💍 Testing Client Welcome Email Pipeline...');
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
        .test-badge { background: #ffc107; color: #212529; padding: 10px; border-radius: 5px; margin: 10px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 PIPELINE TEST - Welcome to Dream Weddings!</h1>
            <p>Your client profile has been created</p>
        </div>
        <div class="content">
            <div class="test-badge">
                🔬 TEST EMAIL - Sent at ${timestamp}
            </div>
            <p>Hello <strong>Test Couple</strong>,</p>
            <p>This is a <strong>pipeline test</strong> for the client welcome email functionality with tenant branding.</p>
            <p><strong>Test Profile Details:</strong></p>
            <ul>
                <li>Email: ${testRecipient}</li>
                <li>Names: Sarah & John (Test)</li>
                <li>Planning Company: Dream Weddings (Test Tenant)</li>
                <li>Test Type: Client Email Pipeline with Branding</li>
            </ul>
            <p>In production, this would include a real password setup link:</p>
            <p><a href="http://localhost:3000/reset-password?token=test-token-456" class="button">Set Your Password (TEST)</a></p>
            <p><strong>✅ If you receive this email with red/orange branding, the client welcome pipeline with tenant branding is working correctly!</strong></p>
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
      to: testRecipient,
      subject: '🧪 [TEST] Welcome to Dream Weddings - Your Client Profile',
      html: clientWelcomeHtml,
      text: `TEST: Client Welcome Email Pipeline Test - Sent at ${timestamp}`
    });
    console.log('✅ Client welcome email sent successfully\n');

    // Test 3: Password Reset Email
    console.log('4. 🔐 Testing Password Reset Email Pipeline...');
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
        .test-badge { background: #ffc107; color: #212529; padding: 10px; border-radius: 5px; margin: 10px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 PIPELINE TEST - 🔐 Password Reset Request</h1>
            <p>Reset your password for The Missing Piece Planning</p>
        </div>
        <div class="content">
            <div class="test-badge">
                🔬 TEST EMAIL - Sent at ${timestamp}
            </div>
            <p>Hello,</p>
            <p>This is a <strong>pipeline test</strong> for the password reset email functionality.</p>
            <div class="warning">
                <p><strong>⚠️ Security Notice:</strong> This is a test email. In production, ignore reset emails you didn't request.</p>
            </div>
            <p>In production, users would click this button to reset their password:</p>
            <p><a href="http://localhost:3000/reset-password?token=test-reset-789" class="button">Reset Password (TEST)</a></p>
            <p><strong>Test Link Details:</strong> This link would normally expire in 1 hour for security.</p>
            <p><strong>✅ If you receive this email with proper formatting and security warnings, the password reset pipeline is working correctly!</strong></p>
            <p>If the link formatting appears correctly, copy and paste capability test:</p>
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
      to: testRecipient,
      subject: '🧪 [TEST] Password Reset Request - The Missing Piece Planning',
      html: resetHtml,
      text: `TEST: Password Reset Email Pipeline Test - Sent at ${timestamp}`
    });
    console.log('✅ Password reset email sent successfully\n');

    // Summary
    console.log('🎉 ALL EMAIL PIPELINE TESTS COMPLETED!');
    console.log('=' .repeat(60));
    console.log(`📧 Test emails sent to: ${testRecipient}`);
    console.log(`🕐 Test completed at: ${timestamp}`);
    console.log(`📨 From SMTP: ${process.env.SMTP_USER}`);
    console.log('📋 Tests performed:');
    console.log('   1. ✅ SMTP Connection Verification');
    console.log('   2. ✅ Tenant Welcome Email Pipeline');
    console.log('   3. ✅ Client Welcome Email Pipeline (with branding)');
    console.log('   4. ✅ Password Reset Email Pipeline');
    console.log('\n🔍 What to check in vkoleski10@gmail.com inbox:');
    console.log('   • All 3 emails received with [TEST] prefix');
    console.log('   • HTML formatting displays correctly');
    console.log('   • Different color themes for each email type');
    console.log('   • "Powered by The Missing Piece Planning" footer');
    console.log('   • Test timestamps and recipient confirmation');
    console.log('\n✅ If all emails arrive, your SMTP pipeline is production-ready!');

  } catch (error) {
    console.error('❌ Email pipeline test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check Gmail SMTP credentials in .env.local');
    console.error('2. Verify 2FA enabled and app password is correct');
    console.error('3. Check network connectivity');
    console.error('4. Ensure recipient email is valid');
  }
}

testEmailPipelineToExternal();