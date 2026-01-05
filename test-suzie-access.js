const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Find Suzie
    const suzie = await prisma.user.findUnique({
      where: { email: 'suzie@plan.com' }
    });

    console.log('\n=== SUZIE (TENANT) ===');
    console.log('Email:', suzie?.email);
    console.log('Role:', suzie?.role);
    console.log('Tenant ID:', suzie?.tenantId);

    if (suzie?.tenantId) {
      // Get Suzie's tenant
      const suzieTenant = await prisma.tenant.findUnique({
        where: { id: suzie.tenantId },
        select: {
          id: true,
          businessName: true,
          brandingCompanyName: true,
          brandingPrimaryColor: true,
          users: { select: { email: true, role: true } },
          clientProfiles: { select: { id: true, couple1FirstName: true } }
        }
      });

      console.log('\nSuzie\'s Tenant:');
      console.log('Tenant ID:', suzieTenant?.id);
      console.log('Business Name:', suzieTenant?.businessName);
      console.log('Branding Company:', suzieTenant?.brandingCompanyName);
      console.log('Branding Color:', suzieTenant?.brandingPrimaryColor);
      console.log('Users:', suzieTenant?.users);
      console.log('Clients:', suzieTenant?.clientProfiles);
    }

    // Find Koleskiv05
    const koleskiv = await prisma.user.findUnique({
      where: { email: 'koleskiv05@yahoo.com' }
    });

    console.log('\n=== KOLESKIV05 (CLIENT) ===');
    console.log('Email:', koleskiv?.email);
    console.log('Role:', koleskiv?.role);
    console.log('Tenant ID:', koleskiv?.tenantId);

    // Find the ClientProfile
    const clientProfile = await prisma.clientProfile.findFirst({
      where: {
        OR: [
          { contactEmail: 'koleskiv05@yahoo.com' },
          { users: { some: { email: 'koleskiv05@yahoo.com' } } }
        ]
      },
      select: {
        id: true,
        couple1FirstName: true,
        tenantId: true,
        tenant: { select: { businessName: true, brandingCompanyName: true } }
      }
    });

    console.log('\nKoleskiv05\'s ClientProfile:');
    console.log('Client ID:', clientProfile?.id);
    console.log('Name:', clientProfile?.couple1FirstName);
    console.log('Assigned Tenant ID:', clientProfile?.tenantId);
    console.log('Tenant Details:', clientProfile?.tenant);

    // Find Tori
    const tori = await prisma.user.findUnique({
      where: { email: 'tori@missingpieceplanning.com' },
      select: { tenantId: true, role: true }
    });

    console.log('\n=== TORI (TENANT) ===');
    console.log('Role:', tori?.role);
    console.log('Tenant ID:', tori?.tenantId);

    if (tori?.tenantId) {
      const toriTenant = await prisma.tenant.findUnique({
        where: { id: tori.tenantId },
        select: { businessName: true, brandingCompanyName: true, brandingPrimaryColor: true }
      });
      console.log('Tenant Business:', toriTenant?.businessName);
      console.log('Tenant Branding:', toriTenant?.brandingCompanyName);
      console.log('Tenant Color:', toriTenant?.brandingPrimaryColor);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
