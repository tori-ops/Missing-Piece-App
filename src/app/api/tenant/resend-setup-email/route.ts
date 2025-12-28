import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/access-control';
import { sendWelcomeEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
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
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Verify the client belongs to this tenant
    const client = await prisma.clientProfile.findFirst({
      where: {
        id: clientId,
        tenantId: user.tenantId
      }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or does not belong to your tenant' },
        { status: 404 }
      );
    }

    // Find the user account for this client
    const clientUser = await prisma.user.findFirst({
      where: {
        clientId: clientId,
        role: 'CLIENT'
      }
    });

    if (!clientUser) {
      return NextResponse.json(
        { error: 'Client user account not found' },
        { status: 404 }
      );
    }

    // Get tenant info and branding for email
    const tenantInfo = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
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

    // Generate new password reset token for secure login
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.user.update({
      where: { id: clientUser.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });

    // Send welcome email with tenant branding
    const emailResult = await sendWelcomeEmail({
      recipientEmail: clientUser.email!,
      recipientName: `${clientUser.firstName} ${clientUser.lastName}`,
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
      console.log('✅ Setup email resent to client:', clientUser.email);
      return NextResponse.json({
        success: true,
        message: 'Setup email sent successfully'
      });
    } else {
      console.error('❌ Setup email failed:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send setup email. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error resending setup email:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: `Failed to resend setup email: ${errorMessage}` },
      { status: 500 }
    );
  }
}
