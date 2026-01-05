const { PrismaClient } = require('@prisma/client');
const { getServerSession } = require('next-auth/next');

const prisma = new PrismaClient();

async function testAuth() {
  // Check what happens with our test scenario
  const tenantId = 'cmj3q2yug0004i89osf5pc0oh';
  const clientId = 'cmjat7d4f0007jv04ye90izd0';
  const testEmail = 'testuser@test.local';

  // Check user exists
  const user = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { tenant: true }
  });

  console.log('Test user found:', !!user);
  if (user) {
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  TenantId:', user.tenantId);
    console.log('  Tenant:', user.tenant?.businessName);
  }

  // Check client
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId }
  });

  console.log('\nClient found:', !!client);
  if (client) {
    console.log('  Name: ', client.couple1FirstName, client.couple1LastName);
    console.log('  TenantId:', client.tenantId);
    console.log('  Belongs to test tenant:', client.tenantId === tenantId);
  }

  console.log('\nExpected API call behavior:');
  console.log('- User with email:', testEmail);
  console.log('- User role must be: TENANT');
  console.log('- User tenantId must match client tenantId');
  console.log('- Result should be: 200 OK with client data');
}

testAuth().catch(console.error).finally(() => prisma.$disconnect());
