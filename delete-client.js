// Delete client profile script
require('dotenv').config({ path: '.env.local' });

// Use the direct URL (port 5432) for migrations/scripts
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:puZZle3m0ji!@db.aocvndwchptpiqybnwsb.supabase.co:5432/postgres';
process.env.DATABASE_URL = databaseUrl;

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteClient() {
  try {
    console.log('🔍 Finding client profile for vkoleski10@gmail.com...\n');

    // Find the client
    const client = await prisma.clientProfile.findUnique({
      where: { email: 'vkoleski10@gmail.com' },
      include: {
        tenant: {
          select: { businessName: true, email: true }
        }
      }
    });

    if (!client) {
      console.log('❌ Client not found with email: vkoleski10@gmail.com\n');
      return;
    }

    console.log('📋 Client Details:');
    console.log(`  - Name: ${client.firstName} ${client.lastName}`);
    console.log(`  - Email: ${client.email}`);
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
    console.log(`  - Email: ${deleted.email}`);
    console.log(`  - ID: ${deleted.id}\n`);

  } catch (error) {
    console.error('❌ Error deleting client:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteClient();
