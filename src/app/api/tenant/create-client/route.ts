import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/access-control';
import { sendWelcomeEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization using new access control
    const authResult = await requireRole(['TENANT']);
    if (!('user' in authResult)) {
      return authResult; // Return error response
    }
    
    const user = authResult.user;
    
    // Verify user has tenantId
    if (!user.tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found for user' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      partnerOneFirstName,
      partnerOneLastName,
      partnerTwoFirstName,
      partnerTwoLastName,
      partnerOneEmail,
      contactPhone,
      addressLine1,
      addressLine2,
      addressCity,
      addressState,
      addressZip,
      budget,
      weddingDate,
      weddingLocation,
      estimatedGuestCount,
      password: providedPassword
    } = body;

    // ========================================================================
    // COMPREHENSIVE INPUT VALIDATION
    // ========================================================================
    
    // Validate required fields
    const requiredFields = { partnerOneFirstName, partnerOneEmail };
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
    if (!emailRegex.test(partnerOneEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate field lengths and formats
    const validationErrors = [];
    
    if (partnerOneEmail.length > 254) validationErrors.push('Email too long (max 254 characters)');
    if (partnerOneFirstName.length > 50) validationErrors.push('Partner one first name too long (max 50 characters)');
    if (partnerOneLastName && partnerOneLastName.length > 50) validationErrors.push('Partner one last name too long (max 50 characters)');
    if (partnerTwoFirstName && partnerTwoFirstName.length > 50) validationErrors.push('Partner two first name too long (max 50 characters)');
    if (partnerTwoLastName && partnerTwoLastName.length > 50) validationErrors.push('Partner two last name too long (max 50 characters)');
    if (contactPhone && contactPhone.length > 20) validationErrors.push('Phone number too long (max 20 characters)');
    if (weddingLocation && weddingLocation.length > 100) validationErrors.push('Wedding location too long (max 100 characters)');
    
    // Validate phone format if provided
    if (contactPhone) {
      const phoneRegex = /^[\d\s\+\-\(\)\.\/x]+$/;
      if (!phoneRegex.test(contactPhone)) {
        validationErrors.push('Invalid phone number format');
      }
    }
    
    // Validate budget if provided
    if (budget && (budget < 0 || budget > 10000000)) {
      validationErrors.push('Budget must be between $0 and $10,000,000');
    }
    
    // Validate guest count if provided
    if (estimatedGuestCount && (estimatedGuestCount < 1 || estimatedGuestCount > 10000)) {
      validationErrors.push('Guest count must be between 1 and 10,000');
    }
    
    // Validate wedding date if provided
    if (weddingDate) {
      const weddingDateObj = new Date(weddingDate);
      const now = new Date();
      const maxDate = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());
      
      if (weddingDateObj < now) {
        validationErrors.push('Wedding date cannot be in the past');
      }
      if (weddingDateObj > maxDate) {
        validationErrors.push('Wedding date cannot be more than 5 years in the future');
      }
    }
    
    // Validate password if provided
    if (providedPassword && providedPassword.length < 8) {
      validationErrors.push('Password must be at least 8 characters long');
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join('; ') },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingClient = await prisma.clientProfile.findUnique({
      where: { contactEmail: partnerOneEmail }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 409 }
      );
    }

    // Generate temporary password if not provided
    const tempPassword = providedPassword || crypto.randomBytes(12).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Parse budget if provided (store in cents)
    const budgetCents = budget ? Math.round(budget * 100) : null;

    // Parse wedding date
    const weddingDateObj = weddingDate ? new Date(weddingDate) : null;

    // Atomic transaction: create client and user together
    const result = await prisma.$transaction(async (tx) => {
      // Get tenant branding for welcome email (but don't store on client)
      const tenantBranding = await tx.tenant.findUnique({
        where: { id: user.tenantId! },
        select: {
          brandingPrimaryColor: true,
          brandingSecondaryColor: true,
          brandingSecondaryColorOpacity: true,
          brandingFontColor: true,
          brandingLogoUrl: true,
          brandingLogoBackgroundRemoval: true,
          brandingCompanyName: true,
          brandingTagline: true,
          brandingFaviconUrl: true,
          brandingFooterText: true,
          brandingFontFamily: true,
          brandingHeaderFontFamily: true,
          brandingBodyFontFamily: true,
        }
      });

      // Create client profile
      const clientProfile = await tx.clientProfile.create({
        data: {
          tenantId: user.tenantId!,
          couple1FirstName: partnerOneFirstName,
          couple1LastName: partnerOneLastName || '',
          couple2FirstName: partnerTwoFirstName || null,
          couple2LastName: partnerTwoLastName || null,
          contactEmail: partnerOneEmail,
          contactPhone: contactPhone || null,
          addressLine1: addressLine1 || null,
          addressLine2: addressLine2 || null,
          addressCity: addressCity || null,
          addressState: addressState || null,
          addressZip: addressZip || null,
          budgetCents,
          weddingDate: weddingDateObj,
          weddingLocation: weddingLocation || null,
          estimatedGuestCount: estimatedGuestCount || null,
          status: 'INVITED',
          createdByUserId: user.id
        }
      });

      // Create user account for client
      const clientUser = await tx.user.create({
        data: {
          email: partnerOneEmail,
          firstName: partnerOneFirstName,
          lastName: partnerOneLastName || '',
          phone: contactPhone || null,
          passwordHash,
          role: 'CLIENT',
          accountStatus: 'ACTIVE',
          clientId: clientProfile.id,
          mustChangePassword: true, // Force password change on first login
          emailVerified: new Date() // Mark as verified since tenant created it
        }
      });

      // Log audit
      await tx.auditLog.create({
        data: {
          action: 'CLIENT_CREATED',
          entity: 'clientprofile',
          entityId: clientProfile.id,
          userId: user.id,
          tenantId: user.tenantId
        }
      });

      return { clientProfile, clientUser };
    });

    // ========================================================================
    // GET TENANT INFO AND BRANDING FOR WELCOME EMAIL
    // ========================================================================
    
    const tenantInfo = await prisma.tenant.findUnique({
      where: { id: user.tenantId! },
      select: {
        businessName: true,
        brandingPrimaryColor: true,
        brandingSecondaryColor: true,
        brandingSecondaryColorOpacity: true,
        brandingFontColor: true,
        brandingCompanyName: true,
        brandingTagline: true,
        brandingLogoUrl: true
      }
    });

    // ========================================================================
    // SEND WELCOME EMAIL WITH PASSWORD RESET LINK
    // ========================================================================
    
    try {
      // Generate password reset token for secure first-time login
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await prisma.user.update({
        where: { id: result.clientUser.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
          mustChangePassword: true // Force password change
        }
      });

      // Send welcome email with tenant branding
      const emailResult = await sendWelcomeEmail({
        recipientEmail: result.clientUser.email!,
        recipientName: `${result.clientUser.firstName} ${result.clientUser.lastName}`,
        role: 'CLIENT',
        resetToken,
        tenantBusinessName: tenantInfo?.businessName || 'Your Wedding Planner',
        tenantBranding: {
          primaryColor: tenantInfo?.brandingPrimaryColor || undefined,
          secondaryColor: tenantInfo?.brandingSecondaryColor || undefined,
          secondaryColorOpacity: tenantInfo?.brandingSecondaryColorOpacity || undefined,
          fontColor: tenantInfo?.brandingFontColor || undefined,
          companyName: tenantInfo?.brandingCompanyName || tenantInfo?.businessName || undefined,
          tagline: tenantInfo?.brandingTagline || undefined,
          logoUrl: tenantInfo?.brandingLogoUrl || undefined
        }
      });

      if (emailResult.success) {
        console.log('✅ Welcome email sent to client:', result.clientUser.email);
      } else {
        console.error('❌ Welcome email failed:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email sending error (non-blocking):', emailError);
    }

    return NextResponse.json({
      success: true,
      clientId: result.clientProfile.id,
      userId: result.clientUser.id,
      couple: `${partnerOneFirstName} ${partnerOneLastName || ''}`,
      email: partnerOneEmail,
      status: result.clientProfile.status,
      temporaryPassword: tempPassword,
      message: 'Client created successfully. Welcome email sent with secure login instructions.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
