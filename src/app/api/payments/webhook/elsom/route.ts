import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/payments/webhook/elsom - Elsom payment callback
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const body = await request.json();
  const { payment_id, status, order_id, amount } = body;

  // Verify request is from Elsom (in production, check IP or signature)
  const apiKey = process.env.ELSOM_SECRET_KEY;
  const requestApiKey = request.headers.get('X-Api-Key');

  if (apiKey && requestApiKey !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find payment
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*, order:orders(*)')
    .eq('provider_response->transactionId', payment_id)
    .single();

  if (error || !payment) {
    console.error('Payment not found:', payment_id);
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  // Map Elsom status to our status
  const statusMap: Record<string, string> = {
    'COMPLETED': 'completed',
    'SUCCESS': 'completed',
    'FAILED': 'failed',
    'CANCELLED': 'failed',
    'PENDING': 'processing'
  };

  const newStatus = statusMap[status] || 'failed';

  // Update payment
  await supabase
    .from('payments')
    .update({
      status: newStatus,
      provider_id: payment_id,
      provider_response: { ...payment.provider_response, webhook: body },
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id);

  // Update order if completed
  if (newStatus === 'completed') {
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_method: 'elsom',
        payment_id: payment.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.order_id);

    // Update sales counts
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', payment.order_id);

    if (orderItems) {
      for (const item of orderItems) {
        const { data: product } = await supabase
          .from('products')
          .select('sold_count, stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({
              sold_count: product.sold_count + item.quantity,
              stock: Math.max(0, product.stock - item.quantity)
            })
            .eq('id', item.product_id);
        }
      }
    }
  }

  return NextResponse.json({ success: true, status: newStatus });
}