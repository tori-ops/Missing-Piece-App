/**
 * Quick script to check notes created by CLIENT users
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Find a CLIENT user
    const clientUser = await prisma.user.findFirst({
      where: { role: 'CLIENT' },
    });

    if (!clientUser) {
      console.log('No CLIENT users found');
      return;
    }

    console.log('CLIENT user:', clientUser.email, clientUser.id, 'clientId:', clientUser.clientId, 'tenantId:', clientUser.tenantId);

    // Find notes created by this user
    const userNotes = await prisma.meetingNote.findMany({
      where: { createdByUserId: clientUser.id },
    });

    console.log(`\nNotes created by ${clientUser.email}:`);
    userNotes.forEach((note) => {
      console.log(`  - ${note.title} (clientId: ${note.clientId}, tenantId: ${note.tenantId})`);
    });

    // Find notes assigned to this user's clientId
    if (clientUser.clientId) {
      const assignedNotes = await prisma.meetingNote.findMany({
        where: { clientId: clientUser.clientId },
      });

      console.log(`\nNotes assigned to clientId ${clientUser.clientId}:`);
      assignedNotes.forEach((note) => {
        console.log(`  - ${note.title} (createdBy: ${note.createdByUserId})`);
      });
    }

    // Find all notes in the user's tenant
    if (clientUser.tenantId) {
      const tenantNotes = await prisma.meetingNote.findMany({
        where: { tenantId: clientUser.tenantId },
      });

      console.log(`\nAll notes in tenant ${clientUser.tenantId}:`);
      tenantNotes.forEach((note) => {
        console.log(`  - ${note.title} (clientId: ${note.clientId}, createdBy: ${note.createdByUserId})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
