#!/usr/bin/env node

/**
 * Setup Tenant User: koleskiv05@yahoo.com
 * Creates or updates a TENANT user account with the specified tenantId
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupTenantUser() {
  try {
    console.log('🔧 Setting up TENANT user account...\n');

    const email = 'koleskiv05@yahoo.com';
    const tenantId = 'cmj3q2yug0004i89osf5pc0oh'; // Suzie's "Once Upon a Plan" tenant
    const firstName = 'Rebel';
    const lastName = 'Walker';
    const plainPassword = 'TenantPassword123!';

    // Hash the password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    console.log('✓ Password hashed\n');

    // Check if user exists
    console.log(`🔍 Checking if user with email "${email}" exists...`);
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (existingUser) {
      console.log('👤 User exists. Updating...\n');
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          tenantId,
          firstName,
          lastName,
          passwordHash,
          role: 'TENANT',
          accountStatus: 'ACTIVE',
          isActive: true
        },
        include: { tenant: true }
      });

      console.log('✅ User Updated Successfully!\n');
      console.log('📋 User Details:');
      console.log(`   Email:    ${updatedUser.email}`);
      console.log(`   Role:     ${updatedUser.role}`);
      console.log(`   Status:   ${updatedUser.accountStatus}`);
      console.log(`   TenantId: ${updatedUser.tenantId}`);
      console.log(`   Tenant:   ${updatedUser.tenant?.name || 'N/A'}`);
      console.log(`   Name:     ${updatedUser.firstName} ${updatedUser.lastName}`);
      console.log(`   UserId:   ${updatedUser.id}\n`);
      
      console.log('🎯 Login Credentials:');
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${plainPassword}`);
      console.log('\n⚠️  User can now log in and reset password if needed.\n');

      return updatedUser;
    } else {
      console.log('✨ User does not exist. Creating new user...\n');

      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
          role: 'TENANT',
          accountStatus: 'ACTIVE',
          isActive: true,
          tenantId,
          emailVerified: new Date() // Mark as verified since we're setting them up
        },
        include: { tenant: true }
      });

      console.log('✅ User Created Successfully!\n');
      console.log('📋 User Details:');
      console.log(`   Email:    ${newUser.email}`);
      console.log(`   Role:     ${newUser.role}`);
      console.log(`   Status:   ${newUser.accountStatus}`);
      console.log(`   TenantId: ${newUser.tenantId}`);
      console.log(`   Tenant:   ${newUser.tenant?.name || 'N/A'}`);
      console.log(`   Name:     ${newUser.firstName} ${newUser.lastName}`);
      console.log(`   UserId:   ${newUser.id}\n`);
      
      console.log('🎯 Login Credentials:');
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${plainPassword}`);
      console.log('\n⚠️  User can now log in. Recommend changing password on first login.\n');

      return newUser;
    }

  } catch (error) {
    console.error('❌ Error setting up user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupTenantUser();
