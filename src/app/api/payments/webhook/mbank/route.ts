import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/payments/webhook/mbank - Mbank payment callback
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const body = await request.json();
  const { transaction_id, status, order_id, amount, signature } = body;

  // Verify signature (in production)
  const secretKey = process.env.MBANK_SECRET_KEY;
  if (secretKey) {
    // TODO: Verify HMAC signature
    // const expectedSignature = crypto
    //   .createHmac('sha256', secretKey)
    //   .update(`${transaction_id}${order_id}${amount}`)
    //   .digest('hex');
    // if (signature !== expectedSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
  }

  // Find payment by provider_response.transactionId
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*, order:orders(*)')
    .eq('provider_response->transactionId', transaction_id)
    .single();

  if (error || !payment) {
    console.error('Payment not found:', transaction_id);
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  // Update payment status
  const newStatus = status === 'success' ? 'completed' : 'failed';

  await supabase
    .from('payments')
    .update({
      status: newStatus,
      provider_id: transaction_id,
      provider_response: { ...payment.provider_response, webhook: body },
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id);

  // Update order status
  if (newStatus === 'completed') {
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_method: 'mbank',
        payment_id: payment.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.order_id);

    // Update product sales count
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', payment.order_id);

    if (orderItems) {
      for (const item of orderItems) {
        await supabase.rpc('increment_product_sales', {
          product_id: item.product_id,
          quantity: item.quantity
        });
      }
    }

    // Update shop sales count
    await supabase.rpc('increment_shop_sales', {
      shop_id: payment.order.shop_id
    });
  }

  return NextResponse.json({ success: true });
}