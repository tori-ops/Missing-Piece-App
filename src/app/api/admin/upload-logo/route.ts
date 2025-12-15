import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg'];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string; // 'logo' or 'favicon'

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Only PNG, JPG, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(`.${ext}`));
    if (!hasValidExtension) {
      return Response.json(
        { error: 'Invalid file extension. Only PNG, JPG, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const ext = fileName.split('.').pop();
    const uniqueFileName = `${fileType}-${uuidv4()}.${ext}`;
    const filePath = join(UPLOAD_DIR, uniqueFileName);

    // Convert file to buffer and write
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // Return relative path for database storage
    const relativePath = `/uploads/${uniqueFileName}`;

    return Response.json(
      { filePath: relativePath },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
