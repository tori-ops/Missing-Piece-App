import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check request size before parsing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 6 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 6MB per image.' }, { status: 413 });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (parseError: any) {
      console.error('Form data parse error:', parseError);
      const errorMessage = parseError?.message || 'Failed to parse form data';
      return NextResponse.json({ error: `Request error: ${errorMessage}` }, { status: 400 });
    }

    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: 'No clientId provided' }, { status: 400 });
    }

    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 6MB per image.' }, { status: 413 });
    }

    // Import at runtime to avoid build-time issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${clientId}/${timestamp}-${random}-${file.name}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase
    const { error } = await supabase.storage
      .from('client-website-images')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-website-images')
      .getPublicUrl(fileName);

    // Save to database
    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();

    try {
      const imageRecord = await db.websiteImage.create({
        data: {
          clientWebsiteId: clientId,
          storageBucket: 'client-website-images',
          storagePath: fileName,
          category: 'uploaded',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        }
      });

      return NextResponse.json({
        success: true,
        image: {
          id: imageRecord.id,
          url: publicUrl,
          category: 'uploaded',
          createdAt: imageRecord.createdAt.toISOString()
        }
      });
    } finally {
      await db.$disconnect();
    }
  } catch (error) {
    console.error('Image upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json({ error: 'Missing image ID' }, { status: 400 });
    }

    // Import at runtime
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const prisma = require('@prisma/client').PrismaClient;
    const db = new prisma();

    const image = await db.websiteImage.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from Supabase storage
    await supabase.storage
      .from('client-website-images')
      .remove([image.imagePath]);

    // Delete from database
    await db.websiteImage.delete({
      where: { id: imageId }
    });

    await db.$disconnect();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
