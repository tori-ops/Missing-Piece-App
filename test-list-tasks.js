const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Simulate fetching as koleskiv05@yahoo.com (CLIENT)
    const user = await prisma.user.findUnique({
      where: { email: 'koleskiv05@yahoo.com' },
      select: {
        id: true,
        email: true,
        role: true,
        clientId: true,
        tenantId: true,
      }
    });

    console.log('User:', user?.email);
    console.log('  Role:', user?.role);
    console.log('  ClientId:', user?.clientId);
    console.log('  TenantId:', user?.tenantId);
    console.log('');

    if (user?.role === 'CLIENT' && user?.clientId) {
      console.log(`Fetching CLIENT tasks with clientId=${user.clientId}...`);
      
      const tasks = await prisma.task.findMany({
        where: {
          clientId: user.clientId,
          assigneeType: 'CLIENT',
          assigneeId: user.clientId,
        },
        select: {
          id: true,
          title: true,
          assigneeType: true,
          assigneeId: true,
          clientId: true,
        }
      });

      console.log(`\nFound ${tasks.length} tasks:\n`);
      tasks.forEach(task => {
        console.log(`  "${task.title}" - assigneeId=${task.assigneeId}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
