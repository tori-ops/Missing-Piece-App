const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all users with CLIENT role
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        clientId: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    console.log('=== CLIENT USERS ===');
    if (clients.length === 0) {
      console.log('No CLIENT users found');
    } else {
      clients.forEach(client => {
        console.log(`
Email: ${client.email}
  Role: ${client.role}
  ClientID: ${client.clientId || 'NULL ❌'}
  TenantID: ${client.tenantId || 'NULL ❌'}
  Status: ${client.accountStatus}
  Created: ${client.createdAt}
        `);
      });
    }

    // Check if CLIENT users have matching ClientProfile
    console.log('\n=== CLIENT PROFILE RELATIONSHIPS ===');
    const clientProfiles = await prisma.clientProfile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        tenantId: true,
        user: {
          select: {
            email: true,
            tenantId: true,
            clientId: true,
          }
        }
      },
    });

    clientProfiles.forEach(profile => {
      console.log(`
Profile: ${profile.firstName} ${profile.lastName}
  Email: ${profile.email}
  TenantID: ${profile.tenantId}
  Has User: ${profile.user ? 'Yes' : 'No'}
  User TenantID: ${profile.user?.tenantId || 'NOT SET'}
        `);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
