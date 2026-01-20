import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/payments/webhook/elsom - Elsom webhook
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const body = await request.json();
    const apiKey = request.headers.get('x-api-key');

    // Verify API key in production
    const secretKey = process.env.ELSOM_SECRET_KEY;
    if (secretKey && apiKey !== secretKey) {
      console.error('Elsom webhook: Invalid API key');
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { payment_id, status } = body;

    // Find payment by provider_id
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, orders(*)')
      .eq('provider_id', payment_id)
      .single();

    if (paymentError || !payment) {
      console.error('Elsom webhook: Payment not found', payment_id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Map Elsom status to our status
    let paymentStatus: string;
    let orderStatus: string;

    switch (status) {
      case 'SUCCESS':
      case 'PAID':
        paymentStatus = 'completed';
        orderStatus = 'paid';
        break;
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        paymentStatus = 'failed';
        orderStatus = 'payment_failed';
        break;
      case 'PENDING':
      case 'PROCESSING':
        paymentStatus = 'processing';
        orderStatus = 'awaiting_payment';
        break;
      default:
        paymentStatus = 'pending';
        orderStatus = 'awaiting_payment';
    }

    // Update payment
    await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        provider_response: body,
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

    console.log(`Elsom webhook: Payment ${payment.id} updated to ${paymentStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Elsom webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
