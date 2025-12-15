// Delete client profile from local SQLite database
const { PrismaClient } = require('@prisma/client');

// Force use of local SQLite database
process.env.DATABASE_URL = 'file:./prisma/dev.db';

const prisma = new PrismaClient();

async function deleteClient() {
  try {
    console.log('🔍 Finding client profile for vkoleski10@gmail.com...\n');

    // Find the client
    const client = await prisma.clientProfile.findUnique({
      where: { contactEmail: 'vkoleski10@gmail.com' },
      include: {
        tenant: {
          select: { businessName: true, email: true }
        }
      }
    });

    if (!client) {
      console.log('❌ Client not found with email: vkoleski10@gmail.com\n');
      console.log('Available clients:');
      const allClients = await prisma.clientProfile.findMany({
        select: { contactEmail: true, couple1FirstName: true, couple1LastName: true }
      });
      if (allClients.length === 0) {
        console.log('  (None)\n');
      } else {
        allClients.forEach(c => console.log(`  - ${c.contactEmail}: ${c.couple1FirstName} ${c.couple1LastName}`));
      }
      return;
    }

    console.log('📋 Client Details:');
    console.log(`  - Name: ${client.couple1FirstName} ${client.couple1LastName}`);
    if (client.couple2FirstName) {
      console.log(`         & ${client.couple2FirstName} ${client.couple2LastName}`);
    }
    console.log(`  - Email: ${client.contactEmail}`);
    console.log(`  - ID: ${client.id}`);
    console.log(`  - Tenant: ${client.tenant.businessName} (${client.tenant.email})`);
    console.log(`  - Wedding Date: ${client.weddingDate ? new Date(client.weddingDate).toLocaleDateString() : 'Not set'}`);
    console.log(`  - Created: ${new Date(client.createdAt).toLocaleDateString()}\n`);

    // Delete the client profile
    console.log('⚠️  Deleting client profile...\n');
    
    const deleted = await prisma.clientProfile.delete({
      where: { id: client.id }
    });

    console.log('✅ Client profile deleted successfully!\n');
    console.log('📊 Deleted client:');
    console.log(`  - Email: ${deleted.contactEmail}`);
    console.log(`  - ID: ${deleted.id}\n`);

  } catch (error) {
    console.error('❌ Error deleting client:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteClient();
