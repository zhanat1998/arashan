import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// PUT /api/orders/[id]/status - Update order status (simplified for MVP)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;

  // Valid statuses (matching database constraint)
  const validStatuses = ['pending', 'awaiting_payment', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: `Туура эмес статус: ${status}. Мүмкүн болгон статустар: ${validStatuses.join(', ')}` }, { status: 400 });
  }

  // Get order first
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Буйрутма табылган жок' }, { status: 404 });
  }

  // Build update object - only use columns that exist in the database
  const updates: Record<string, any> = {
    status
  };

  // Update order
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, order: data });
}