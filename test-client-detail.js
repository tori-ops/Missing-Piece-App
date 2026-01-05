const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Get the first tenant
  const tenant = await prisma.tenant.findFirst();
  console.log('Tenant:', tenant?.id, tenant?.businessName);

  // Get or create a test user for this tenant
  const testEmail = 'testuser@test.local';
  let user = await prisma.user.findUnique({
    where: { email: testEmail }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        passwordHash: null,
        role: 'TENANT',
        tenantId: tenant.id,
        accountStatus: 'ACTIVE',
        isActive: true,
        emailVerified: new Date()
      }
    });
    console.log('Created test user:', user.email);
  } else {
    console.log('Test user exists:', user.email);
  }

  // Get clients for this tenant
  const clients = await prisma.clientProfile.findMany({
    where: { tenantId: tenant.id },
    take: 5
  });

  console.log('Clients for tenant:', clients.length);
  clients.forEach(c => {
    console.log(`  - ${c.id}: ${c.couple1FirstName} ${c.couple1LastName}`);
  });

  if (clients.length > 0) {
    console.log('\nTo test client detail page:');
    console.log(`1. Use client ID: ${clients[0].id}`);
    console.log(`2. Navigate to: http://localhost:3000/dashboard/tenant/client/${clients[0].id}`);
    console.log(`3. Check browser console for API logs`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
