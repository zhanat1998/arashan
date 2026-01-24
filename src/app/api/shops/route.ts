import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/shops - List all shops
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');

  const offset = (page - 1) * limit;

  let query = supabase
    .from('shops')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    shops: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}

// POST /api/shops - Create a new shop
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Check if user already has a shop
  const { data: existingShop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (existingShop) {
    return NextResponse.json({ error: 'Сизде мурунтан дүкөн бар' }, { status: 400 });
  }

  const body = await request.json();
  const { name, description, logo, banner, location, phone, whatsapp, telegram } = body;

  if (!name) {
    return NextResponse.json({ error: 'Дүкөн аты керек' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('shops')
    .insert({
      owner_id: user.id,
      name,
      description: description || '',
      logo: logo || null,
      banner: banner || null,
      location: location || '',
      phone: phone || '',
      whatsapp: whatsapp || '',
      telegram: telegram || '',
      is_active: true,
      is_verified: false,
      rating: 0,
      followers_count: 0,
      products_count: 0,
      total_sales: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Shop creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update user role to seller
  await supabase
    .from('users')
    .update({ role: 'seller' })
    .eq('id', user.id);

  return NextResponse.json(data, { status: 201 });
}
