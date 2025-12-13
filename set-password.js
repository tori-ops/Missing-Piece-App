const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setPassword() {
  try {
    const email = 'works@test.local';
    const password = 'test123!';
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        passwordHash: passwordHash,
        mustChangePassword: false
      }
    });
    
    console.log('✓ Password updated successfully');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Password: ${password}`);
    console.log(`Must Change Password: ${updatedUser.mustChangePassword}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setPassword();
