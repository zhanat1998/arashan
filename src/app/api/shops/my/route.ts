import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/shops/my - Get current user's shop
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { data: shop, error } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!shop) {
    return NextResponse.json(null);
  }

  return NextResponse.json(shop);
}

// PUT /api/shops/my - Update current user's shop
export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Get user's shop
  const { data: existingShop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!existingShop) {
    return NextResponse.json({ error: 'Дүкөн табылган жок' }, { status: 404 });
  }

  const body = await request.json();
  const allowedFields = ['name', 'description', 'logo', 'banner', 'location', 'phone', 'whatsapp', 'telegram'];

  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('shops')
    .update(updates)
    .eq('id', existingShop.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
