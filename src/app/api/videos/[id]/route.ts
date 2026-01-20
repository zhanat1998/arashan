import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const S3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// GET /api/videos/[id] - Get single video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      shop:shops(id, name, logo),
      product:products(id, title, images, price)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Видео табылган жок' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// DELETE /api/videos/[id] - Delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Get user's shop
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: 'Дүкөн табылган жок' }, { status: 404 });
  }

  // Get video and verify ownership
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .eq('shop_id', shop.id)
    .single();

  if (videoError || !video) {
    return NextResponse.json({ error: 'Видео табылган жок же сизге таандык эмес' }, { status: 404 });
  }

  // Delete video file from R2 if it exists
  if (video.video_url) {
    try {
      const publicUrl = process.env.R2_PUBLIC_URL;
      if (publicUrl && video.video_url.startsWith(publicUrl)) {
        const key = video.video_url.replace(publicUrl + '/', '');
        await S3.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
          })
        );
      }
    } catch (err) {
      console.error('Error deleting video file from R2:', err);
      // Continue with database deletion even if R2 deletion fails
    }
  }

  // Delete thumbnail from R2 if it exists
  if (video.thumbnail_url) {
    try {
      const publicUrl = process.env.R2_PUBLIC_URL;
      if (publicUrl && video.thumbnail_url.startsWith(publicUrl)) {
        const key = video.thumbnail_url.replace(publicUrl + '/', '');
        await S3.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
          })
        );
      }
    } catch (err) {
      console.error('Error deleting thumbnail from R2:', err);
    }
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: 'Өчүрүүдө ката кетти' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Видео өчүрүлдү' });
}
