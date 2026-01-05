const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const clientId = 'cmjat7d4f0007jv04ye90izd0';
  const tenantId = 'cmj3q2yug0004i89osf5pc0oh';

  // Test query - same as API endpoint
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
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

  console.log('Client found:', !!client);
  if (client) {
    console.log('Client details:');
    console.log(JSON.stringify(client, null, 2));
    
    console.log('\nTenant check:');
    console.log('Client tenantId:', client.tenantId);
    console.log('Expected tenantId:', tenantId);
    console.log('Match:', client.tenantId === tenantId);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
