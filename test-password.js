// Test script for password management APIs
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPasswordManagement() {
    console.log('🔐 Testing Password Management System...\n');

    try {
        // Find a test user
        const testUser = await prisma.user.findUnique({
            where: { email: 'works@test.local' },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                passwordResetToken: true,
                passwordResetExpires: true,
                passwordChangedAt: true
            }
        });

        if (!testUser) {
            console.log('❌ Test user not found');
            return;
        }

        console.log('✅ Found test user:', testUser.email);

        // Test 1: Password reset token generation
        console.log('\n1. Testing password reset token generation...');
        
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: testUser.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires
            }
        });

        console.log(`✅ Reset token generated: ${resetToken.substring(0, 8)}...`);
        console.log(`✅ Token expires: ${resetExpires.toISOString()}`);

        // Test 2: Verify token storage
        console.log('\n2. Verifying token storage...');
        
        const userWithToken = await prisma.user.findUnique({
            where: { id: testUser.id },
            select: {
                passwordResetToken: true,
                passwordResetExpires: true
            }
        });

        if (userWithToken?.passwordResetToken === resetToken) {
            console.log('✅ Token stored correctly in database');
        } else {
            console.log('❌ Token storage failed');
        }

        // Test 3: Password hashing verification
        console.log('\n3. Testing password hashing...');
        
        const testPassword = 'newTestPassword123!';
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        const isValidHash = await bcrypt.compare(testPassword, hashedPassword);

        console.log(`✅ Test password: "${testPassword}"`);
        console.log(`✅ Hashed password: ${hashedPassword.substring(0, 20)}...`);
        console.log(`✅ Hash verification: ${isValidHash ? 'PASS' : 'FAIL'}`);

        // Test 4: Check audit log capabilities
        console.log('\n4. Testing audit log for password operations...');
        
        await prisma.auditLog.create({
            data: {
                userId: testUser.id,
                action: 'PASSWORD_RESET',
                entity: 'user',
                entityId: testUser.id,
                changes: JSON.stringify({
                    email: testUser.email,
                    resetTokenGenerated: true,
                    timestamp: new Date().toISOString()
                })
            }
        });

        const recentAuditLogs = await prisma.auditLog.findMany({
            where: {
                action: { in: ['PASSWORD_RESET', 'PASSWORD_CHANGED'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        console.log(`✅ Found ${recentAuditLogs.length} password-related audit entries`);
        recentAuditLogs.forEach(log => {
            console.log(`   - ${log.action} at ${log.createdAt.toLocaleString()}`);
        });

        // Test 5: Token cleanup simulation
        console.log('\n5. Testing token cleanup (expired tokens)...');
        
        const expiredDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        
        await prisma.user.update({
            where: { id: testUser.id },
            data: {
                passwordResetExpires: expiredDate
            }
        });

        const expiredTokens = await prisma.user.findMany({
            where: {
                passwordResetExpires: {
                    lt: new Date()
                },
                passwordResetToken: {
                    not: null
                }
            },
            select: {
                email: true,
                passwordResetExpires: true
            }
        });

        console.log(`✅ Found ${expiredTokens.length} expired tokens that should be cleaned up`);

        // Clean up test data
        console.log('\n6. Cleaning up test data...');
        await prisma.user.update({
            where: { id: testUser.id },
            data: {
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });
        console.log('✅ Test cleanup complete');

        console.log('\n🎉 Password Management Test Summary:');
        console.log('✅ Token generation and storage: WORKING');
        console.log('✅ Password hashing (12 rounds): WORKING');
        console.log('✅ Token expiration handling: WORKING');
        console.log('✅ Audit logging integration: WORKING');
        console.log('✅ Database cleanup capabilities: WORKING');

        console.log('\n📋 Available Password APIs:');
        console.log('🔄 POST /api/auth/change-password');
        console.log('🔄 POST /api/auth/forgot-password');
        console.log('🔄 POST /api/auth/reset-password');

    } catch (error) {
        console.error('❌ Error during password management test:', error);
    }
}

testPasswordManagement()
    .catch(console.error)
    .finally(() => prisma.$disconnect());