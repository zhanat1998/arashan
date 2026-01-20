import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/payments/webhook/odengi - O!Dengi webhook
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    // Verify Basic auth in production
    const merchantId = process.env.ODENGI_MERCHANT_ID;
    const secretKey = process.env.ODENGI_SECRET_KEY;

    if (merchantId && secretKey && authHeader) {
      const expectedAuth = `Basic ${Buffer.from(`${merchantId}:${secretKey}`).toString('base64')}`;
      if (authHeader !== expectedAuth) {
        console.error('O!Dengi webhook: Invalid auth');
        return NextResponse.json({ error: 'Invalid auth' }, { status: 401 });
      }
    }

    const { transaction_id, status, order_id, amount, phone } = body;

    // Find payment by provider_id
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, orders(*)')
      .eq('provider_id', transaction_id)
      .single();

    if (paymentError || !payment) {
      console.error('O!Dengi webhook: Payment not found', transaction_id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Map O!Dengi status to our status
    let paymentStatus: string;
    let orderStatus: string;

    switch (status) {
      case 'completed':
      case 'success':
        paymentStatus = 'completed';
        orderStatus = 'paid';
        break;
      case 'failed':
      case 'rejected':
      case 'expired':
        paymentStatus = 'failed';
        orderStatus = 'payment_failed';
        break;
      case 'pending':
      case 'processing':
        paymentStatus = 'processing';
        orderStatus = 'awaiting_payment';
        break;
      default:
        paymentStatus = 'pending';
        orderStatus = 'awaiting_payment';
    }

    // Update payment with phone info
    await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        provider_response: body,
        metadata: { ...payment.metadata, phone },
        paid_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    // Update order
    await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.order_id);

    // If payment completed, update product stock
    if (paymentStatus === 'completed') {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', payment.order_id);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase.rpc('decrement_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity
          });
        }
      }
    }

    console.log(`O!Dengi webhook: Payment ${payment.id} updated to ${paymentStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('O!Dengi webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
