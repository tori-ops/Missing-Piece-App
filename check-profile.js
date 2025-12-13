const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const profile = await prisma.clientProfile.findUnique({
      where: { id: 'cmj3blhax0009i8ns464cqjs3' }
    });
    
    if (profile) {
      console.log('Client Profile found:');
      console.log(JSON.stringify(profile, null, 2));
    } else {
      console.log('No profile found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
