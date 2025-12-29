const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== TASKS IN DATABASE ===\n');

    const tasks = await prisma.task.findMany({
      select: {
        id: true,
        title: true,
        assigneeType: true,
        assigneeId: true,
        clientId: true,
        tenantId: true,
        createdBy: {
          select: {
            email: true,
            role: true,
          }
        }
      }
    });

    if (tasks.length === 0) {
      console.log('No tasks found');
    } else {
      tasks.forEach(task => {
        console.log(`Task: "${task.title}"`);
        console.log(`  ID: ${task.id}`);
        console.log(`  AssigneeType: ${task.assigneeType}`);
        console.log(`  AssigneeId: ${task.assigneeId}`);
        console.log(`  ClientId: ${task.clientId || 'NULL'}`);
        console.log(`  TenantId: ${task.tenantId}`);
        console.log(`  Created by: ${task.createdBy.email} (${task.createdBy.role})`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
