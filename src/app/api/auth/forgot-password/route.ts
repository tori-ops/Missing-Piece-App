import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // ========================================================================
    // INPUT VALIDATION
    // ========================================================================
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ========================================================================
    // FIND USER
    // ========================================================================

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      }, { status: 200 });
    }

    // ========================================================================
    // GENERATE RESET TOKEN
    // ========================================================================

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });

    // Log audit trail
    try {
      await prisma.auditLog.create({
        data: {
          entity: 'user',
          entityId: user.id,
          action: 'PASSWORD_RESET',
          userId: user.id,
          tenantId: user.tenantId || undefined,
          metadata: JSON.stringify({
            resetTokenGenerated: true,
            expiresAt: resetExpires.toISOString()
          })
        }
      });
    } catch (auditError) {
      console.log('Audit log error (non-blocking):', auditError);
    }

    // ========================================================================
    // SEND EMAIL
    // ========================================================================
    
    if (user) {
      try {
        const emailResult = await sendPasswordResetEmail(
          user.email!,
          resetToken,
          `${user.firstName} ${user.lastName}`
        );
        
        if (emailResult.success) {
          console.log('✅ Password reset email sent successfully');
        } else {
          console.error('❌ Email sending failed:', emailResult.error);
          // Don't reveal email failure to user for security
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        // Don't reveal email failure to user for security
      }
    }

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('🔑 Password Reset URL:', resetUrl);

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent',
      // Remove these in production - only for testing
      ...(process.env.NODE_ENV === 'development' && {
        resetUrl,
        resetToken,
        expiresAt: resetExpires.toISOString()
      })
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}