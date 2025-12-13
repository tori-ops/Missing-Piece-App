const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function linkProfile() {
  try {
    // Get the most recently created client profile
    const latestProfile = await prisma.clientProfile.findFirst({
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    if (!latestProfile) {
      console.error('❌ No client profile found');
      return;
    }

    console.log('📋 Latest profile found:');
    console.log(`ID: ${latestProfile.id}`);
    console.log(`Name: ${latestProfile.couple1FirstName} ${latestProfile.couple1LastName}`);
    console.log(`Email: ${latestProfile.contactEmail}`);

    // Update ivy@test.local user to link to this profile
    const updatedUser = await prisma.user.update({
      where: { email: 'ivy@test.local' },
      data: { clientId: latestProfile.id }
    });

    console.log('\n✓ User linked successfully');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`ClientId: ${updatedUser.clientId}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

linkProfile();
