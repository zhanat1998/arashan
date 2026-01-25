import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { uploadToR2, generateFileName } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'image';

    if (!file) {
      return NextResponse.json({ error: 'Файл жок' }, { status: 400 });
    }

    // Validate file type
    const isVideo = type === 'video';
    const isImage = type === 'image';

    if (isVideo && !file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Видео файл керек' }, { status: 400 });
    }

    if (isImage && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Сүрөт файл керек' }, { status: 400 });
    }

    // Check file size (100MB for video, 10MB for image)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `Файл өтө чоң. Максимум: ${isVideo ? '100MB' : '10MB'}`
      }, { status: 400 });
    }

    // Generate unique filename
    const fileName = generateFileName(user.id, file.name, isVideo ? 'video' : 'image');

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudflare R2
    const publicUrl = await uploadToR2(buffer, fileName, file.type);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Жүктөөдө ката кетти' },
      { status: 500 }
    );
  }
}