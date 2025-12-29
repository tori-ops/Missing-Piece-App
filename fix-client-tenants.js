const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Updating CLIENT users with their correct tenantId...\n');

    // Update vkoleski10@gmail.com
    const update1 = await prisma.user.update({
      where: { email: 'vkoleski10@gmail.com' },
      data: { tenantId: 'cmj9av3ty0000l104ergqbxck' },
      select: {
        email: true,
        clientId: true,
        tenantId: true,
        clientProfile: {
          select: {
            couple1FirstName: true,
            couple1LastName: true,
            tenant: { select: { businessName: true } }
          }
        }
      }
    });

    console.log('✅ Updated:', update1.email);
    console.log(`   Client: ${update1.clientProfile?.couple1FirstName} ${update1.clientProfile?.couple1LastName}`);
    console.log(`   Tenant: ${update1.clientProfile?.tenant?.businessName}`);
    console.log(`   New TenantID: ${update1.tenantId}\n`);

    // Update koleskiv05@yahoo.com
    const update2 = await prisma.user.update({
      where: { email: 'koleskiv05@yahoo.com' },
      data: { tenantId: 'cmj3q2yug0004i89osf5pc0oh' },
      select: {
        email: true,
        clientId: true,
        tenantId: true,
        clientProfile: {
          select: {
            couple1FirstName: true,
            couple1LastName: true,
            tenant: { select: { businessName: true } }
          }
        }
      }
    });

    console.log('✅ Updated:', update2.email);
    console.log(`   Client: ${update2.clientProfile?.couple1FirstName} ${update2.clientProfile?.couple1LastName}`);
    console.log(`   Tenant: ${update2.clientProfile?.tenant?.businessName}`);
    console.log(`   New TenantID: ${update2.tenantId}\n`);

    console.log('✨ All CLIENT users now have correct tenantId!');
    console.log('Tasks should now be creatable from client dashboard.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
