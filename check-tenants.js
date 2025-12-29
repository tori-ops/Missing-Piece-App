const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        businessName: true,
        primary_email: true,
        isActive: true,
      },
    });

    console.log('=== AVAILABLE TENANTS ===');
    tenants.forEach(tenant => {
      console.log(`
Tenant ID: ${tenant.id}
  Business: ${tenant.businessName}
  Email: ${tenant.primary_email}
  Active: ${tenant.isActive}
      `);
    });

    // Get CLIENT users that need linking
    const clients = await prisma.user.findMany({
      where: { 
        role: 'CLIENT',
        tenantId: null
      },
      select: {
        id: true,
        email: true,
        clientId: true,
      },
    });

    console.log('\n=== CLIENT USERS NEEDING TENANT LINK ===');
    clients.forEach(client => {
      console.log(`
Client ID: ${client.id}
  Email: ${client.email}
  ClientID: ${client.clientId}
      `);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
