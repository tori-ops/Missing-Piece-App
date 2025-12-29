/**
 * Check the actual schema of meeting_note_attachments table
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Query the information schema to see columns
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'meeting_note_attachments'
      ORDER BY ordinal_position;
    `;

    console.log('Columns in meeting_note_attachments table:');
    result.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
