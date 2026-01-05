const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();

async function testFlow() {
  console.log('\n=== Testing Client Detail Flow ===\n');

  // 1. Get tenant
  const tenant = await prisma.tenant.findFirst();
  console.log('✓ Tenant found:', tenant.businessName);

  // 2. Get test user for this tenant
  const user = await prisma.user.findFirst({
    where: { 
      tenantId: tenant.id,
      role: 'TENANT'
    }
  });
  
  if (!user) {
    console.log('✗ No TENANT user found for this tenant');
    return;
  }
  
  console.log('✓ User found:', user.email, '(', user.role, ')');

  // 3. Get clients for this tenant
  const clients = await prisma.clientProfile.findMany({
    where: { tenantId: tenant.id },
    take: 1
  });

  if (clients.length === 0) {
    console.log('✗ No clients found');
    return;
  }

  const client = clients[0];
  console.log('✓ Client found:', client.couple1FirstName, client.couple1LastName, '(ID:', client.id, ')');
  console.log('  Client tenant ID:', client.tenantId);
  console.log('  User tenant ID:', user.tenantId);
  console.log('  Match:', client.tenantId === user.tenantId ? '✓ YES' : '✗ NO');

  // 4. Test the database query directly (what API does)
  console.log('\n=== Testing Database Query ===\n');
  
  const apiQueryResult = await prisma.clientProfile.findUnique({
    where: { id: client.id },
    select: {
      id: true,
      tenantId: true,
      couple1FirstName: true,
      couple1LastName: true,
      couple2FirstName: true,
      couple2LastName: true,
      contactEmail: true,
      contactPhone: true,
      weddingDate: true,
      weddingLocation: true,
      budgetCents: true,
      status: true,
      createdAt: true,
      addressLine1: true,
      addressLine2: true,
      addressCity: true,
      addressState: true,
      addressZip: true,
      ceremonyTime: true,
      venuePhone: true,
      venueWebsite: true,
      estimatedGuestCount: true,
    }
  });

  if (apiQueryResult) {
    console.log('✓ Query returned data');
    console.log('  First name:', apiQueryResult.couple1FirstName);
    console.log('  Last name:', apiQueryResult.couple1LastName);
    console.log('  Email:', apiQueryResult.contactEmail);
    console.log('  Wedding date:', apiQueryResult.weddingDate);
    console.log('  Wedding location:', apiQueryResult.weddingLocation);
  } else {
    console.log('✗ Query returned no data');
  }

  // 5. Verify auth check would work
  console.log('\n=== Testing Authorization Logic ===\n');
  
  const checkUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  if (!checkUser || checkUser.role !== 'TENANT' || !checkUser.tenantId) {
    console.log('✗ Auth check would fail');
    return;
  }

  console.log('✓ Auth check passes');

  if (apiQueryResult.tenantId !== checkUser.tenantId) {
    console.log('✗ Tenant ownership check would fail');
    console.log('  Client tenantId:', apiQueryResult.tenantId);
    console.log('  User tenantId:', checkUser.tenantId);
    return;
  }

  console.log('✓ Tenant ownership check passes');

  console.log('\n✓ All checks passed! The API endpoint should work.\n');
}

testFlow().catch(console.error).finally(() => prisma.$disconnect());
