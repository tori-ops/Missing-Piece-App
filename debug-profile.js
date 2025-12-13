const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProfile() {
  try {
    const profile = await prisma.clientProfile.findFirst({
      where: { contactEmail: 'ivy@test.local' },
      include: { tenant: true }
    });
    
    console.log('Profile and Tenant:', JSON.stringify(profile, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

checkProfile();
