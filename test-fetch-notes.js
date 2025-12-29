/**
 * Test the exact query that listMeetingNotes uses for CLIENTs
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

    console.log('CLIENT user:', clientUser.email, 'userId:', clientUser.id, 'clientId:', clientUser.clientId);

    // This is the exact query from listMeetingNotes for CLIENT role
    const notes = await prisma.meetingNote.findMany({
      where: {
        clientId: clientUser.clientId,
        tenantId: clientUser.tenantId,
        OR: [
          // Their own notes
          { createdByUserId: clientUser.id },
          // Notes created by TENANT users (planners)
          {
            createdBy: {
              role: 'TENANT',
            },
          },
        ],
      },
      include: {
        attachments: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${notes.length} notes:`);
    notes.forEach((note) => {
      console.log(`  - ${note.title} (by ${note.createdBy.email}, role: ${note.createdBy.role})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
