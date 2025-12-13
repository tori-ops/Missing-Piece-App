import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================================
// SEED SCRIPT - LOCAL DEVELOPMENT DATA
// Run: npx prisma db seed
// ============================================================================

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean up existing data (for fresh starts)
  // Uncomment to reset:
  // await prisma.auditLog.deleteMany({});
  // await prisma.loginAttempt.deleteMany({});
  // etc.

  // ========================================================================
  // CREATE SUPERADMIN
  // ========================================================================
  console.log('👤 Creating SUPERADMIN user...');

  const superadminPassword = await bcrypt.hash('SuperAdmin123!', 12);
  const superadmin = await prisma.user.upsert({
    where: { email: 'dean@missingpieceplanning.com' },
    update: {},
    create: {
      email: 'dean@missingpieceplanning.com',
      firstName: 'Dean',
      lastName: 'Admin',
      role: 'SUPERADMIN',
      accountStatus: 'ACTIVE',
      emailVerified: new Date(),
      passwordHash: superadminPassword,
      isActive: true,
      twoFactorEnabled: false
    }
  });

  console.log(`✓ SUPERADMIN created: ${superadmin.email}\n`);

  // ========================================================================
  // CREATE TORI'S TENANT
  // ========================================================================
  console.log('🏢 Creating Tori tenant...');

  const toriTenant = await prisma.tenant.upsert({
    where: { primary_email: 'tori@missingpieceplanning.com' },
    update: {},
    create: {
      primary_email: 'tori@missingpieceplanning.com',
      firstName: 'Tori',
      lastName: 'Admin',
      businessName: 'The Missing Piece Planning',
      phone: '555-0000',
      email: 'tori@missingpieceplanning.com',
      webAddress: 'www.missingpieceplanning.com',
      status: 'ACTIVE',
      subscriptionTier: 'PAID',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      // Branding
      brandingPrimaryColor: '#D0CEB5',
      brandingSecondaryColor: '#F5F3EB',
      brandingSecondaryColorOpacity: 70,
      brandingFontColor: '#274E13',
      brandingCompanyName: 'The Missing Piece Planning',
      brandingTagline: 'Planning Made Perfect',
      brandingHeaderFontFamily: "'Playfair Display', serif",
      brandingBodyFontFamily: "'Poppins', sans-serif"
    }
  });

  console.log(`✓ Tori tenant created: ${toriTenant.businessName}\n`);

  // ========================================================================
  // CREATE TORI TENANT USER
  // ========================================================================
  console.log('👤 Creating TORI tenant user...');

  const toriPassword = await bcrypt.hash('Tori2025!', 12);
  const toriUser = await prisma.user.upsert({
    where: { email: 'tori@missingpieceplanning.com' },
    update: {},
    create: {
      email: 'tori@missingpieceplanning.com',
      firstName: 'Tori',
      lastName: 'Admin',
      phone: '555-0000',
      role: 'TENANT',
      tenantId: toriTenant.id,
      accountStatus: 'ACTIVE',
      emailVerified: new Date(),
      passwordHash: toriPassword,
      isActive: true,
      mustChangePassword: false,
      twoFactorEnabled: false
    }
  });

  console.log(`✓ TORI tenant user created: ${toriUser.email}\n`);

  // ========================================================================
  // CREATE TEST TENANT
  // ========================================================================
  console.log('🏢 Creating test tenant...');

  const tenant = await prisma.tenant.upsert({
    where: { primary_email: 'sarah@eliteweddings.local' },
    update: {},
    create: {
      primary_email: 'sarah@eliteweddings.local',
      firstName: 'Sarah',
      lastName: 'Johnson',
      businessName: 'Elite Weddings Co',
      phone: '555-1234',
      email: 'sarah@eliteweddings.local',
      webAddress: 'www.eliteweddings.local',
      status: 'ACTIVE',
      subscriptionTier: 'PAID',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      // Branding
      brandingPrimaryColor: '#274E13',
      brandingSecondaryColor: '#E8F5E9',
      brandingSecondaryColorOpacity: 60,
      brandingFontColor: '#1B5E20',
      brandingCompanyName: 'Elite Weddings Co',
      brandingTagline: 'Your Perfect Day, Perfectly Planned',
      brandingHeaderFontFamily: "'Playfair Display', serif",
      brandingBodyFontFamily: "'Poppins', sans-serif"
    }
  });

  console.log(`✓ Tenant created: ${tenant.businessName}\n`);

  // ========================================================================
  // CREATE TENANT ADMIN USER
  // ========================================================================
  console.log('👤 Creating tenant admin user...');

  const tenantPassword = await bcrypt.hash('TenantPassword123!', 10);
  const tenantUser = await prisma.user.upsert({
    where: { email: 'sarah@eliteweddings.local' },
    update: {},
    create: {
      email: 'sarah@eliteweddings.local',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '555-1234',
      role: 'TENANT',
      tenantId: tenant.id,
      accountStatus: 'ACTIVE',
      emailVerified: new Date(),
      passwordHash: tenantPassword,
      isActive: true,
      mustChangePassword: false,
      twoFactorEnabled: false
    }
  });

  console.log('✓ Tenant admin created: ${tenantUser.email}\n');

  // ========================================================================
  // CREATE SECOND TEST TENANT - "Once Upon a Plan"
  // ========================================================================
  console.log('🏢 Creating second test tenant...');

  const tenant2 = await prisma.tenant.upsert({
    where: { primary_email: 'suzie@plan.com' },
    update: {},
    create: {
      primary_email: 'suzie@plan.com',
      firstName: 'Suzie',
      lastName: 'Martinez',
      businessName: 'Once Upon a Plan',
      phone: '555-9999',
      email: 'suzie@plan.com',
      webAddress: 'www.onceuponaplan.com',
      status: 'ACTIVE',
      subscriptionTier: 'PAID',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      // Branding
      brandingPrimaryColor: '#8B4789',
      brandingSecondaryColor: '#F5E6F0',
      brandingSecondaryColorOpacity: 55,
      brandingFontColor: '#2C1C3C',
      brandingCompanyName: 'Once Upon a Plan',
      brandingTagline: 'Making wedding dreams come true',
      brandingHeaderFontFamily: "'Playfair Display', serif",
      brandingBodyFontFamily: "'Poppins', sans-serif"
    }
  });

  console.log(`✓ Tenant created: ${tenant2.businessName}\n`);

  // ========================================================================
  // CREATE SECOND TENANT USER
  // ========================================================================
  console.log('👤 Creating second tenant user...');

  const tenant2Password = await bcrypt.hash('TenantPassword123!', 10);
  const tenant2User = await prisma.user.upsert({
    where: { email: 'suzie@plan.com' },
    update: {},
    create: {
      email: 'suzie@plan.com',
      firstName: 'Suzie',
      lastName: 'Martinez',
      phone: '555-9999',
      role: 'TENANT',
      tenantId: tenant2.id,
      accountStatus: 'ACTIVE',
      emailVerified: new Date(),
      passwordHash: tenant2Password,
      isActive: true,
      mustChangePassword: false,
      twoFactorEnabled: false
    }
  });

  console.log(`✓ Second tenant user created: ${tenant2User.email}\n`);

  // ========================================================================
  // CREATE AUDIT LOG ENTRIES
  // ========================================================================
  console.log('📋 Creating audit logs...');

  await prisma.auditLog.createMany({
    data: [
      {
        action: 'TENANT_CREATED',
        entity: 'tenant',
        entityId: tenant.id,
        userId: superadmin.id,
        tenantId: tenant.id,
        metadata: JSON.stringify({
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          businessName: tenant.businessName,
          email: tenant.email
        })
      },
      {
        action: 'USER_CREATED',
        entity: 'user',
        entityId: tenantUser.id,
        userId: superadmin.id,
        tenantId: tenant.id,
        metadata: JSON.stringify({
          email: tenantUser.email,
          role: tenantUser.role,
          firstName: tenantUser.firstName
        })
      }
    ]
  });

  console.log('✓ Audit logs created\n');

  // ========================================================================
  // SUMMARY
  // ========================================================================
  console.log('========================================');
  console.log('✨ SEEDING COMPLETE!');
  console.log('========================================\n');

  console.log('📝 Test Credentials:\n');
  console.log('SUPERADMIN:');
  console.log('  Email: dean@missingpieceplanning.com');
  console.log('  Password: SuperAdmin123!\n');

  console.log('TENANT 0 - The Missing Piece Planning (TORI):');
  console.log('  Email: tori@missingpieceplanning.com');
  console.log('  Password: Tori2025!\n');

  console.log('TENANT 1 - Elite Weddings Co:');
  console.log('  Email: sarah@eliteweddings.local');
  console.log('  Password: TenantPassword123!\n');

  console.log('TENANT 2 - Once Upon a Plan:');
  console.log('  Email: suzie@plan.com');
  console.log('  Password: TenantPassword123!\n');

  console.log('========================================\n');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('✓ Disconnected from database\n');
  });
