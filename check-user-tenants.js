const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserTenants() {
  try {
    const emails = ['suzie@plan.com', 'koleskiv05@yahoo.com'];
    
    console.log('\n========== CHECKING USER TENANT ASSIGNMENTS ==========\n');
    
    for (const email of emails) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          tenant: true
        }
      });
      
      if (user) {
        console.log(`Email: ${email}`);
        console.log(`  - User ID: ${user.id}`);
        console.log(`  - Tenant ID: ${user.tenantId || 'NOT SET'}`);
        
        if (user.tenant) {
          console.log(`  - Tenant Name: ${user.tenant.businessName || user.tenant.firstName} ${user.tenant.lastName}`);
          console.log(`  - Tenant Email: ${user.tenant.email}`);
        } else {
          console.log(`  - Tenant Name: NOT FOUND`);
        }
      } else {
        console.log(`Email: ${email}`);
        console.log(`  - User NOT FOUND in database`);
      }
      
      console.log('');
    }
    
    // Also check if there are any tenants to understand the setup
    console.log('\n========== ALL TENANTS IN DATABASE ==========\n');
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        businessName: true,
        firstName: true,
        lastName: true,
        email: true,
        primary_email: true,
        users: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (tenants.length > 0) {
      tenants.forEach(tenant => {
        console.log(`Tenant: ${tenant.businessName || tenant.firstName} ${tenant.lastName}`);
        console.log(`  ID: ${tenant.id}`);
        console.log(`  Email: ${tenant.email}`);
        console.log(`  Users (${tenant.users.length}):`);
        tenant.users.forEach(user => {
          console.log(`    - ${user.email} (${user.firstName} ${user.lastName})`);
        });
        console.log('');
      });
    } else {
      console.log('No tenants found in database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserTenants();
