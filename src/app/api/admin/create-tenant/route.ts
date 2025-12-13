import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/access-control';
import { sendWelcomeEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization using new access control
    const authResult = await requireRole(['SUPERADMIN']);
    if ('user' in authResult) {
      // User is authorized
    } else {
      // authResult is a NextResponse with error
      return authResult;
    }

    const body = await request.json();
    const {
      primary_email,
      firstName,
      lastName,
      businessName,
      phone,
      webAddress,
      password,
      subscriptionTier = 'PAID',
      brandingPrimaryColor,
      brandingSecondaryColor,
      brandingSecondaryColorOpacity,
      brandingFontColor,
      brandingCompanyName,
      brandingTagline,
      brandingHeaderFontFamily,
      brandingBodyFontFamily
    } = body;

    // ========================================================================
    // COMPREHENSIVE INPUT VALIDATION
    // ========================================================================
    
    // Validate required fields
    const requiredFields = { primary_email, firstName, lastName, businessName, phone, webAddress };
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(primary_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate field lengths and formats
    const validationErrors = [];
    
    if (primary_email.length > 254) validationErrors.push('Email too long (max 254 characters)');
    if (firstName.length > 50) validationErrors.push('First name too long (max 50 characters)');
    if (lastName.length > 50) validationErrors.push('Last name too long (max 50 characters)');
    if (businessName.length > 100) validationErrors.push('Business name too long (max 100 characters)');
    if (phone.length > 20) validationErrors.push('Phone number too long (max 20 characters)');
    if (webAddress.length > 255) validationErrors.push('Web address too long (max 255 characters)');
    
    // Validate phone format (basic)
    const phoneRegex = /^[\d\s\+\-\(\)\.\/x]+$/;
    if (!phoneRegex.test(phone)) {
      validationErrors.push('Invalid phone number format');
    }
    
    // Validate web address format
    if (webAddress && !webAddress.startsWith('http')) {
      validationErrors.push('Web address must start with http:// or https://');
    }
    
    // Validate password if provided
    if (password && password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long');
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join('; ') },
        { status: 400 }
      );
    }

    // Check if primary_email already exists (immutable identifier uniqueness)
    const existingTenant = await prisma.tenant.findUnique({
      where: { primary_email }
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Tenant with this email already exists' },
        { status: 409 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: primary_email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate temporary password if not provided
    const finalPassword = password || crypto.randomBytes(12).toString('hex');
    const passwordHash = await bcrypt.hash(finalPassword, 12);

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant with immutable primary_email
      const tenant = await tx.tenant.create({
        data: {
          primary_email,
          email: primary_email, // Initially same, but primary_email is immutable
          firstName,
          lastName,
          businessName,
          phone,
          webAddress,
          status: 'ACTIVE',
          subscriptionTier,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
          // Branding
          brandingPrimaryColor: brandingPrimaryColor || '#274E13',
          brandingSecondaryColor: brandingSecondaryColor || '#E8F5E9',
          brandingSecondaryColorOpacity: brandingSecondaryColorOpacity || 60,
          brandingFontColor: brandingFontColor || '#1B5E20',
          brandingCompanyName: brandingCompanyName || businessName,
          brandingTagline: brandingTagline || '',
          brandingHeaderFontFamily: brandingHeaderFontFamily || "'Playfair Display', serif",
          brandingBodyFontFamily: brandingBodyFontFamily || "'Poppins', sans-serif"
        }
      });

      // 2. Create User account linked to Tenant (identity binding)
      const tenantUser = await tx.user.create({
        data: {
          email: primary_email,
          firstName,
          lastName,
          phone,
          role: 'TENANT',
          tenantId: tenant.id,
          accountStatus: 'ACTIVE',
          emailVerified: new Date(),
          passwordHash,
          isActive: true,
          mustChangePassword: !password, // Force change if temp password
          twoFactorEnabled: false
        }
      });

      return { tenant, tenantUser, password: finalPassword };
    });

    // Log audit trail
    try {
      await prisma.auditLog.create({
        data: {
          entity: 'tenant',
          entityId: result.tenant.id,
          action: 'TENANT_CREATED',
          userId: authResult.user.id,
          tenantId: result.tenant.id,
          metadata: JSON.stringify({
            primary_email: result.tenant.primary_email,
            businessName: result.tenant.businessName
          })
        }
      });
    } catch (auditError) {
      console.log('Audit log error (non-blocking):', auditError);
    }

    // ========================================================================
    // SEND WELCOME EMAIL WITH PASSWORD RESET LINK
    // ========================================================================
    
    try {
      // Generate password reset token for secure first-time login
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await prisma.user.update({
        where: { id: result.tenantUser.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
          mustChangePassword: true // Force password change
        }
      });

      // Send welcome email
      const emailResult = await sendWelcomeEmail({
        recipientEmail: result.tenantUser.email!,
        recipientName: `${result.tenantUser.firstName} ${result.tenantUser.lastName}`,
        role: 'TENANT',
        resetToken,
        businessName: result.tenant.businessName
      });

      if (emailResult.success) {
        console.log('✅ Welcome email sent to tenant:', result.tenantUser.email);
      } else {
        console.error('❌ Welcome email failed:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email sending error (non-blocking):', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Tenant created successfully with auto-linked user account',
      tenant: {
        id: result.tenant.id,
        primary_email: result.tenant.primary_email,
        businessName: result.tenant.businessName,
        status: result.tenant.status
      },
      user: {
        id: result.tenantUser.id,
        email: result.tenantUser.email,
        role: result.tenantUser.role
      },
      temporaryPassword: !password ? result.password : undefined
    }, { status: 201 });

  } catch (error) {
    console.error('Tenant creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
