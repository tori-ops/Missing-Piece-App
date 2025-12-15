// Delete client from Supabase production database directly
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:puZZle3m0ji!@db.aocvndwchptpiqybnwsb.supabase.co:5432/postgres'
});

async function deleteClient() {
  try {
    console.log('🔌 Connecting to Supabase database...\n');
    await client.connect();
    console.log('✅ Connected to Supabase\n');

    console.log('🔍 Checking if ClientProfile table exists...\n');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ClientProfile'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ ClientProfile table does not exist in the database');
      console.log('   The production database has not been migrated yet.');
      console.log('   Run: npx prisma db push\n');
      return;
    }

    console.log('✅ ClientProfile table exists\n');
    console.log('🔍 Looking for client with email: vkoleski10@gmail.com...\n');

    // Check if client exists
    const result = await client.query(
      'SELECT id, "contactEmail", "couple1FirstName", "couple1LastName", "couple2FirstName", "couple2LastName", "weddingDate", "tenantId" FROM "ClientProfile" WHERE "contactEmail" = $1',
      ['vkoleski10@gmail.com']
    );

    if (result.rows.length === 0) {
      console.log('❌ Client not found\n');
      console.log('Available clients:\n');
      const allClients = await client.query(
        'SELECT "contactEmail", "couple1FirstName", "couple1LastName" FROM "ClientProfile" ORDER BY "createdAt" DESC LIMIT 10'
      );
      if (allClients.rows.length === 0) {
        console.log('  (No clients in database)\n');
      } else {
        allClients.rows.forEach(c => {
          console.log(`  - ${c.contactEmail}: ${c.couple1FirstName} ${c.couple1LastName}`);
        });
        console.log();
      }
      return;
    }

    const clientRow = result.rows[0];
    console.log('📋 Client Found:');
    console.log(`  - Name: ${clientRow.couple1FirstName} ${clientRow.couple1LastName}`);
    if (clientRow.couple2FirstName) {
      console.log(`         & ${clientRow.couple2FirstName} ${clientRow.couple2LastName}`);
    }
    console.log(`  - Email: ${clientRow.contactEmail}`);
    console.log(`  - ID: ${clientRow.id}`);
    console.log(`  - Wedding Date: ${clientRow.weddingDate ? new Date(clientRow.weddingDate).toLocaleDateString() : 'Not set'}\n`);

    console.log('⚠️  Deleting client profile...\n');

    // Delete the client
    const deleteResult = await client.query(
      'DELETE FROM "ClientProfile" WHERE "contactEmail" = $1 RETURNING id, "contactEmail"',
      ['vkoleski10@gmail.com']
    );

    console.log('✅ Client profile deleted successfully!\n');
    console.log('📊 Deleted:');
    console.log(`  - Email: ${deleteResult.rows[0].contactEmail}`);
    console.log(`  - ID: ${deleteResult.rows[0].id}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Could not connect to database. Check network connectivity.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

deleteClient();
