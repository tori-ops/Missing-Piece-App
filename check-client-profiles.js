const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get CLIENT profiles with their tenant info
    const clientProfiles = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: {
        clientProfile: {
          select: {
            id: true,
            couple1FirstName: true,
            couple1LastName: true,
            tenantId: true,
            tenant: {
              select: {
                id: true,
                businessName: true,
              }
            }
          }
        }
      }
    });

    console.log('=== CLIENT USERS & THEIR PROFILE TENANTS ===');
    clientProfiles.forEach(user => {
      console.log(`
User Email: ${user.email}
  User TenantID: ${user.tenantId || 'NULL ❌'}
  User ClientID: ${user.clientId}
  Client Profile: ${user.clientProfile ? user.clientProfile.couple1FirstName + ' ' + user.clientProfile.couple1LastName : 'NOT FOUND'}
  Profile TenantID: ${user.clientProfile?.tenantId}
  Profile Tenant: ${user.clientProfile?.tenant?.businessName}
      `);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
