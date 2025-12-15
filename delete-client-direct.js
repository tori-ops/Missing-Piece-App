// Direct database deletion using pg
const { Client } = require('pg');

async function deleteClient() {
  const client = new Client({
    host: 'db.aocvndwchptpiqybnwsb.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'puZZle3m0ji!',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // First, find the client
    const findResult = await client.query(
      'SELECT id, "firstName", "lastName", email, "weddingDate", "tenantId" FROM "ClientProfile" WHERE email = $1',
      ['vkoleski10@gmail.com']
    );

    if (findResult.rows.length === 0) {
      console.log('❌ Client not found with email: vkoleski10@gmail.com\n');
      await client.end();
      return;
    }

    const clientRecord = findResult.rows[0];
    console.log('📋 Client Found:');
    console.log(`  - Name: ${clientRecord.firstName} ${clientRecord.lastName}`);
    console.log(`  - Email: ${clientRecord.email}`);
    console.log(`  - ID: ${clientRecord.id}`);
    console.log(`  - Wedding Date: ${clientRecord.weddingDate ? new Date(clientRecord.weddingDate).toLocaleDateString() : 'Not set'}`);
    console.log(`  - Tenant ID: ${clientRecord.tenantId}\n`);

    // Delete the client
    console.log('⚠️  Deleting client profile...\n');
    
    const deleteResult = await client.query(
      'DELETE FROM "ClientProfile" WHERE email = $1 RETURNING id, email',
      ['vkoleski10@gmail.com']
    );

    console.log('✅ Client profile deleted successfully!\n');
    console.log('📊 Deleted:');
    console.log(`  - Email: ${deleteResult.rows[0].email}`);
    console.log(`  - ID: ${deleteResult.rows[0].id}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deleteClient();
