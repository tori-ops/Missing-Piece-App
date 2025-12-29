/**
 * Test script to create a meeting note for a CLIENT user
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

    console.log('Found CLIENT user:', clientUser.email, 'clientId:', clientUser.clientId, 'tenantId:', clientUser.tenantId);

    // Create a test note
    const note = await prisma.meetingNote.create({
      data: {
        title: 'Test Note from Direct Creation',
        body: 'This is a test note created directly via database',
        tenantId: clientUser.tenantId,
        clientId: clientUser.clientId,
        createdByUserId: clientUser.id,
        meetingDate: new Date(),
      },
    });

    console.log('Note created successfully:', note.id, note.title);

    // Verify it can be fetched
    const fetchedNote = await prisma.meetingNote.findUnique({
      where: { id: note.id },
      include: {
        createdBy: {
          select: { email: true, role: true },
        },
      },
    });

    console.log('Fetched note:', fetchedNote);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
