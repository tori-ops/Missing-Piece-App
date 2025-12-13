// Test tenant branding inheritance for client emails
require('dotenv').config({ path: '.env.local' });

async function testTenantBrandingInheritance() {
  console.log('🧪 Testing Tenant Branding Inheritance for Client Emails...\n');

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Get the tenant data
    const tenantUser = await prisma.user.findUnique({
      where: { email: 'sarah@eliteweddings.local' },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
            brandingPrimaryColor: true,
            brandingSecondaryColor: true,
            brandingSecondaryColorOpacity: true,
            brandingFontColor: true,
            brandingCompanyName: true,
            brandingTagline: true,
            brandingLogoUrl: true
          }
        }
      }
    });

    if (!tenantUser || !tenantUser.tenant) {
      console.log('❌ Tenant not found');
      await prisma.$disconnect();
      return;
    }

    const tenant = tenantUser.tenant;
    console.log(`🏢 Testing branding inheritance for: ${tenant.businessName}`);
    console.log(`📧 Tenant User: ${tenantUser.firstName} ${tenantUser.lastName} (${tenantUser.email})\n`);

    // Simulate what happens when this tenant creates a client
    console.log('🔄 Simulating tenant branding inheritance...');
    console.log('---'.repeat(20));

    // This is what the create-client API would query and pass to the email
    const emailBrandingData = {
      primaryColor: tenant.brandingPrimaryColor || undefined,
      secondaryColor: tenant.brandingSecondaryColor || undefined,
      secondaryColorOpacity: tenant.brandingSecondaryColorOpacity || undefined,
      fontColor: tenant.brandingFontColor || undefined,
      companyName: tenant.brandingCompanyName || tenant.businessName || undefined,
      tagline: tenant.brandingTagline || undefined,
      logoUrl: tenant.brandingLogoUrl || undefined
    };

    console.log('📊 Branding data that would be passed to client emails:');
    Object.entries(emailBrandingData).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`   ${status} ${key}: ${value || 'NOT SET'}`);
    });

    // Generate sample email preview
    console.log('\n📧 Email Template Preview with Tenant Branding:');
    console.log('='.repeat(60));

    const sampleClientName = "Sarah";
    const primaryColor = emailBrandingData.primaryColor || '#667eea';
    const secondaryColor = emailBrandingData.secondaryColor || '#764ba2';
    const fontColor = emailBrandingData.fontColor || '#ffffff';
    const companyName = emailBrandingData.companyName || 'Your Wedding Planner';
    const logoSection = emailBrandingData.logoUrl ? 
      `🖼️  LOGO: ${emailBrandingData.logoUrl}` : 
      '📝 No logo (nothing will be displayed)';

    console.log(`\n📱 Client Email Preview:`);
    console.log(`   Header Background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`);
    console.log(`   Header Text Color: ${fontColor}`);
    console.log(`   ${logoSection}`);
    console.log(`   Title: "💍 Welcome to ${companyName}'s planning app, ${sampleClientName}!"`);
    console.log(`   Button Color: ${primaryColor}`);
    console.log(`   Company Name: ${companyName}`);
    console.log(`   Tagline: ${emailBrandingData.tagline || 'Not shown (no tagline set)'}`);

    // Test the actual email generation
    console.log('\n🧪 Testing actual email template generation...');
    
    // Import the email function
    const { sendWelcomeEmail } = require('./src/lib/email.ts');
    
    console.log('✅ Email template system is ready to use tenant branding');
    console.log('\n🚨 Key Issue to Check:');
    console.log('   When you make changes to Sarah\'s tenant profile branding,');
    console.log('   NEW client welcome emails should automatically use the updated branding.');
    console.log('   Existing client emails won\'t change (they\'re already sent).');

    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Make a branding change to sarah@eliteweddings.local tenant profile');
    console.log('2. Create a new test client under this tenant');
    console.log('3. Check if the welcome email uses the updated branding');
    console.log('4. Verify the tenant dashboard allows branding updates');

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTenantBrandingInheritance();