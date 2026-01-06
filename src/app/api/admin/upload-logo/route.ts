import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only SUPERADMIN can upload branding files
    if ((session.user as any)?.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Only superadmins can upload branding files' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string; // 'logo', 'favicon', or 'overlay'
    const tenantId = formData.get('tenantId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!fileType || !['logo', 'favicon', 'overlay'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be logo, favicon, or overlay' },
        { status: 400 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(`.${ext}`));
    if (!hasValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only PNG, JPG, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Import Supabase at runtime
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Generate unique filename: tenant-{fileType}-{timestamp}.{ext}
    const ext = fileName.split('.').pop();
    const timestamp = Date.now();
    const storagePath = `${fileType}s/${tenantId}-${fileType}-${timestamp}.${ext}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase tenant-branding bucket
    const { error: uploadError } = await supabase.storage
      .from('tenant-branding')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'Upload failed' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tenant-branding')
      .getPublicUrl(storagePath);

    return NextResponse.json(
      { 
        filePath: publicUrl,
        fileName: `${tenantId}-${fileType}-${timestamp}.${ext}`,
        size: file.size,
        type: file.type,
        storagePath
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
