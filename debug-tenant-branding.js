// Debug script to check tenant profile and branding inheritance issues
require('dotenv').config({ path: '.env.local' });

async function debugTenantProfile() {
  console.log('🔍 Debugging Tenant Profile Branding Inheritance...\n');

  try {
    // Import Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Find the tenant profile for sarah@eliteweddings.local
    console.log('1. 🔎 Looking up tenant profile: sarah@eliteweddings.local');
    
    const tenantUser = await prisma.user.findUnique({
      where: { email: 'sarah@eliteweddings.local' },
      include: {
        tenant: {
          include: {
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
              }
            },
            clientProfiles: {
              select: {
                id: true,
                contactEmail: true,
                couple1FirstName: true,
                couple1LastName: true,
                couple2FirstName: true,
                couple2LastName: true
              }
            }
          }
        }
      }
    });

    if (!tenantUser) {
      console.log('❌ No user found with email: sarah@eliteweddings.local');
      console.log('\n📋 Available tenant users:');
      
      const tenantUsers = await prisma.user.findMany({
        where: { role: 'TENANT' },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          tenant: {
            select: {
              businessName: true,
              status: true
            }
          }
        }
      });
      
      tenantUsers.forEach(user => {
        console.log(`   📧 ${user.email} - ${user.firstName} ${user.lastName} (${user.tenant?.businessName})`);
      });
      
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Found tenant user: ${tenantUser.firstName} ${tenantUser.lastName}`);
    
    if (!tenantUser.tenant) {
      console.log('❌ User exists but has no associated tenant record');
      await prisma.$disconnect();
      return;
    }

    const tenant = tenantUser.tenant;
    console.log(`📊 Tenant: ${tenant.businessName} (${tenant.status})\n`);

    // Display current tenant branding
    console.log('🎨 Current Tenant Branding:');
    console.log(`   Primary Color: ${tenant.brandingPrimaryColor || 'NOT SET'}`);
    console.log(`   Secondary Color: ${tenant.brandingSecondaryColor || 'NOT SET'}`);
    console.log(`   Secondary Color Opacity: ${tenant.brandingSecondaryColorOpacity || 'NOT SET'}`);
    console.log(`   Font Color: ${tenant.brandingFontColor || 'NOT SET'}`);
    console.log(`   Company Name: ${tenant.brandingCompanyName || 'NOT SET'}`);
    console.log(`   Tagline: ${tenant.brandingTagline || 'NOT SET'}`);
    console.log(`   Logo URL: ${tenant.brandingLogoUrl || 'NOT SET'}`);
    console.log(`   Header Font: ${tenant.brandingHeaderFontFamily || 'NOT SET'}`);
    console.log(`   Body Font: ${tenant.brandingBodyFontFamily || 'NOT SET'}`);

    // Show all users associated with this tenant
    console.log(`\n👥 All Users Associated with ${tenant.businessName}:`);
    tenant.users.forEach(user => {
      console.log(`   📧 ${user.email} - ${user.firstName} ${user.lastName} (${user.role})`);
    });

    // Show all client profiles
    console.log(`\n💑 Client Profiles (${tenant.clientProfiles.length} total):`);
    if (tenant.clientProfiles.length === 0) {
      console.log('   No client profiles found');
    } else {
      tenant.clientProfiles.forEach(client => {
        const clientName = client.couple2FirstName ? 
          `${client.couple1FirstName} & ${client.couple2FirstName}` :
          client.couple1FirstName;
        console.log(`   💍 ${clientName} - ${client.contactEmail}`);
      });
    }

    // Check for inheritance issues
    console.log('\n🔧 Branding Inheritance Analysis:');
    
    const brandingFields = [
      'brandingPrimaryColor',
      'brandingSecondaryColor', 
      'brandingSecondaryColorOpacity',
      'brandingFontColor',
      'brandingCompanyName',
      'brandingTagline',
      'brandingLogoUrl',
      'brandingHeaderFontFamily',
      'brandingBodyFontFamily'
    ];

    const missingBranding = brandingFields.filter(field => !tenant[field]);
    
    if (missingBranding.length > 0) {
      console.log(`⚠️  Missing branding fields: ${missingBranding.join(', ')}`);
      console.log('   These should be set to ensure proper client email branding');
    } else {
      console.log('✅ All branding fields are configured');
    }

    // Test what client emails would look like
    if (tenant.clientProfiles.length > 0) {
      console.log('\n📧 Example Client Email Branding (first client):');
      const sampleClient = tenant.clientProfiles[0];
      console.log(`   Recipient: ${sampleClient.couple1FirstName} (${sampleClient.contactEmail})`);
      console.log(`   Company Name: ${tenant.brandingCompanyName || tenant.businessName}`);
      console.log(`   Primary Color: ${tenant.brandingPrimaryColor || '#667eea'} (fallback)`);
      console.log(`   Secondary Color: ${tenant.brandingSecondaryColor || '#764ba2'} (fallback)`);
      console.log(`   Logo: ${tenant.brandingLogoUrl || 'No logo - will show nothing'}`);
    }

    // Check for potential issues
    console.log('\n🚨 Potential Issues:');
    const issues = [];
    
    if (!tenant.brandingPrimaryColor || !tenant.brandingSecondaryColor) {
      issues.push('Missing primary/secondary colors - client emails will use default colors');
    }
    
    if (!tenant.brandingCompanyName && tenant.businessName !== tenant.brandingCompanyName) {
      issues.push('Branding company name not set - will use business name as fallback');
    }
    
    if (tenant.clientProfiles.some(c => !c.contactEmail)) {
      issues.push('Some client profiles have no contact email');
    }

    if (issues.length === 0) {
      console.log('✅ No obvious branding inheritance issues detected');
    } else {
      issues.forEach(issue => console.log(`   ❌ ${issue}`));
    }

    console.log(`\n📝 Recommendations:`);
    console.log('1. Ensure all branding fields are set in the tenant profile');
    console.log('2. Test creating a new client to verify branding inheritance');
    console.log('3. Check that existing client emails would use current branding');
    console.log('4. Verify tenant dashboard allows branding updates');

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugTenantProfile();