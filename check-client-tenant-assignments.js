const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkClientTenantAssignments() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    CLIENT-TENANT ASSIGNMENT AUDIT                           ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    // Get all tenants first
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        businessName: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    console.log('📋 ALL TENANTS IN SYSTEM:');
    console.log('─'.repeat(100));
    tenants.forEach((tenant) => {
      console.log(`  ${tenant.id} | ${tenant.businessName} | ${tenant.firstName} ${tenant.lastName}`);
    });

    // Get all clients with their tenant info
    const allClients = await prisma.clientProfile.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { tenantId: 'asc' },
    });

    console.log('\n\n📊 ALL CLIENTS AND THEIR TENANT ASSIGNMENTS:');
    console.log('─'.repeat(100));
    console.log(`Total Clients Found: ${allClients.length}\n`);

    if (allClients.length === 0) {
      console.log('⚠️  No clients found in the database!\n');
    } else {
      allClients.forEach((client) => {
        const coupleNames = client.couple2FirstName
          ? `${client.couple1FirstName} ${client.couple1LastName} & ${client.couple2FirstName} ${client.couple2LastName}`
          : `${client.couple1FirstName} ${client.couple1LastName}`;

        console.log(`Client: ${coupleNames}`);
        console.log(`  ├─ Email: ${client.contactEmail}`);
        console.log(`  ├─ Status: ${client.status}`);
        console.log(`  ├─ Assigned TenantId: ${client.tenantId}`);
        console.log(`  └─ Assigned Tenant: ${client.tenant?.businessName || 'UNASSIGNED'}`);
        console.log('');
      });
    }

    // Check Tori's tenant (The Missing Piece Planning and Events, LLC)
    const toriTenantId = 'cmj9av3ty0000l104ergqbxck';
    console.log('\n🔍 CHECKING TORI\'S TENANT (cmj9av3ty0000l104ergqbxck):');
    console.log('─'.repeat(100));

    const toriClients = await prisma.clientProfile.findMany({
      where: { tenantId: toriTenantId },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    const toriTenant = tenants.find((t) => t.id === toriTenantId);
    console.log(
      `Tenant: ${toriTenant ? toriTenant.businessName : 'NOT FOUND'} (${toriTenantId})`
    );
    console.log(`Clients Assigned: ${toriClients.length}`);

    if (toriClients.length === 0) {
      console.log('⚠️  No clients assigned to Tori\'s tenant!\n');
    } else {
      console.log('');
      toriClients.forEach((client) => {
        const coupleNames = client.couple2FirstName
          ? `${client.couple1FirstName} ${client.couple1LastName} & ${client.couple2FirstName} ${client.couple2LastName}`
          : `${client.couple1FirstName} ${client.couple1LastName}`;
        console.log(`  ✓ ${coupleNames} (${client.contactEmail})`);
      });
      console.log('');
    }

    // Check Suzie's tenant (Once Upon a Plan)
    const suzieTenantId = 'cmj3q2yug0004i89osf5pc0oh';
    console.log('\n🔍 CHECKING SUZIE\'S TENANT (cmj3q2yug0004i89osf5pc0oh):');
    console.log('─'.repeat(100));

    const suzieClients = await prisma.clientProfile.findMany({
      where: { tenantId: suzieTenantId },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    const suzieTenant = tenants.find((t) => t.id === suzieTenantId);
    console.log(
      `Tenant: ${suzieTenant ? suzieTenant.businessName : 'NOT FOUND'} (${suzieTenantId})`
    );
    console.log(`Clients Assigned: ${suzieClients.length}`);

    if (suzieClients.length === 0) {
      console.log('⚠️  No clients assigned to Suzie\'s tenant!\n');
    } else {
      console.log('');
      suzieClients.forEach((client) => {
        const coupleNames = client.couple2FirstName
          ? `${client.couple1FirstName} ${client.couple1LastName} & ${client.couple2FirstName} ${client.couple2LastName}`
          : `${client.couple1FirstName} ${client.couple1LastName}`;
        console.log(`  ✓ ${coupleNames} (${client.contactEmail})`);
      });
      console.log('');
    }

    // Check for potential issues
    console.log('\n⚠️  POTENTIAL ISSUES:');
    console.log('─'.repeat(100));

    const clientsWithMissingTenant = allClients.filter((c) => !c.tenant);
    const duplicateEmails = allClients.filter(
      (c, i) => allClients.findIndex((x) => x.contactEmail === c.contactEmail) !== i
    );

    if (clientsWithMissingTenant.length > 0) {
      console.log(
        `\n❌ ${clientsWithMissingTenant.length} client(s) with missing or invalid tenant reference:`
      );
      clientsWithMissingTenant.forEach((client) => {
        const coupleNames = client.couple2FirstName
          ? `${client.couple1FirstName} ${client.couple1LastName} & ${client.couple2FirstName} ${client.couple2LastName}`
          : `${client.couple1FirstName} ${client.couple1LastName}`;
        console.log(`  - ${coupleNames} (tenantId: ${client.tenantId})`);
      });
    } else {
      console.log('\n✅ All clients have valid tenant references');
    }

    if (duplicateEmails.length > 0) {
      console.log(`\n⚠️  ${duplicateEmails.length} client(s) with duplicate emails:`);
      duplicateEmails.forEach((client) => {
        const coupleNames = client.couple2FirstName
          ? `${client.couple1FirstName} ${client.couple1LastName} & ${client.couple2FirstName} ${client.couple2LastName}`
          : `${client.couple1FirstName} ${client.couple1LastName}`;
        console.log(`  - ${client.contactEmail}: ${coupleNames}`);
      });
    } else {
      console.log('\n✅ No duplicate email addresses found');
    }

    // Summary
    console.log('\n\n📈 SUMMARY:');
    console.log('─'.repeat(100));
    console.log(`Total Tenants: ${tenants.length}`);
    console.log(`Total Clients: ${allClients.length}`);
    console.log(`Tori's Tenant Clients: ${toriClients.length}`);
    console.log(`Suzie's Tenant Clients: ${suzieClients.length}`);
    console.log('');

    // Breakdown by tenant
    const clientsByTenant = {};
    allClients.forEach((client) => {
      if (!clientsByTenant[client.tenantId]) {
        clientsByTenant[client.tenantId] = 0;
      }
      clientsByTenant[client.tenantId]++;
    });

    console.log('Clients per Tenant:');
    Object.entries(clientsByTenant).forEach(([tenantId, count]) => {
      const tenant = tenants.find((t) => t.id === tenantId);
      console.log(`  - ${tenant ? tenant.businessName : 'UNKNOWN'}: ${count} client(s)`);
    });

    console.log('\n✅ Audit complete!\n');
  } catch (error) {
    console.error('❌ Error during audit:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkClientTenantAssignments();
