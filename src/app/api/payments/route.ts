import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/payments - Create payment
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, method, returnUrl } = body;

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Буйрутма табылган жок' }, { status: 404 });
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      user_id: user.id,
      amount: order.total_amount,
      method,
      status: 'pending'
    })
    .select()
    .single();

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // Generate payment URL based on method
  let paymentUrl = '';
  let paymentData = {};

  switch (method) {
    case 'mbank':
      paymentData = await initiateMbankPayment(payment, order, returnUrl);
      paymentUrl = (paymentData as { paymentUrl?: string }).paymentUrl || '';
      break;

    case 'elsom':
      paymentData = await initiateElsomPayment(payment, order, returnUrl);
      paymentUrl = (paymentData as { paymentUrl?: string }).paymentUrl || '';
      break;

    case 'balance':
      // Pay from user's coin balance
      const { data: userData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', user.id)
        .single();

      const coinsNeeded = order.total_amount; // 1 coin = 1 som

      if ((userData?.coins || 0) < coinsNeeded) {
        return NextResponse.json({
          error: 'Баланс жетишсиз',
          required: coinsNeeded,
          available: userData?.coins || 0
        }, { status: 400 });
      }

      // Deduct coins and complete payment
      await supabase
        .from('users')
        .update({ coins: (userData?.coins || 0) - coinsNeeded })
        .eq('id', user.id);

      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', payment.id);

      await supabase
        .from('orders')
        .update({ status: 'paid', payment_id: payment.id })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        message: 'Төлөм ийгиликтүү аяктады!',
        payment: { ...payment, status: 'completed' }
      });

    default:
      return NextResponse.json({ error: 'Туура эмес төлөм методу' }, { status: 400 });
  }

  // Update payment with provider data
  await supabase
    .from('payments')
    .update({
      status: 'processing',
      provider_response: paymentData
    })
    .eq('id', payment.id);

  return NextResponse.json({
    paymentId: payment.id,
    paymentUrl,
    ...paymentData
  });
}

// Mbank payment integration
async function initiateMbankPayment(
  payment: { id: string; amount: number },
  order: { order_number: string },
  returnUrl: string
) {
  const merchantId = process.env.MBANK_MERCHANT_ID;
  const secretKey = process.env.MBANK_SECRET_KEY;
  const apiUrl = process.env.MBANK_API_URL || 'https://api.mbank.kg';

  if (!merchantId || !secretKey) {
    // Return mock data for development
    return {
      paymentUrl: `https://mbank.kg/pay?amount=${payment.amount}&order=${order.order_number}`,
      transactionId: `mbank_${Date.now()}`,
      mock: true
    };
  }

  // Real Mbank API integration
  try {
    const response = await fetch(`${apiUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: payment.amount,
        currency: 'KGS',
        order_id: order.order_number,
        description: `Pinduo Shop буйрутма #${order.order_number}`,
        return_url: returnUrl,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/mbank`
      })
    });

    const data = await response.json();
    return {
      paymentUrl: data.payment_url,
      transactionId: data.transaction_id
    };
  } catch (error) {
    console.error('Mbank error:', error);
    throw new Error('Mbank төлөм катасы');
  }
}

// Elsom payment integration
async function initiateElsomPayment(
  payment: { id: string; amount: number },
  order: { order_number: string },
  returnUrl: string
) {
  const merchantId = process.env.ELSOM_MERCHANT_ID;
  const secretKey = process.env.ELSOM_SECRET_KEY;
  const apiUrl = process.env.ELSOM_API_URL || 'https://api.elsom.kg';

  if (!merchantId || !secretKey) {
    // Return mock data for development
    return {
      paymentUrl: `https://elsom.kg/pay?amount=${payment.amount}&order=${order.order_number}`,
      transactionId: `elsom_${Date.now()}`,
      mock: true
    };
  }

  // Real Elsom API integration
  try {
    const response = await fetch(`${apiUrl}/api/v1/payment/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Merchant-Id': merchantId,
        'X-Api-Key': secretKey
      },
      body: JSON.stringify({
        amount: payment.amount,
        currency: 'KGS',
        order_id: order.order_number,
        description: `Pinduo Shop #${order.order_number}`,
        success_url: returnUrl,
        fail_url: `${returnUrl}?status=failed`,
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/elsom`
      })
    });

    const data = await response.json();
    return {
      paymentUrl: data.redirect_url,
      transactionId: data.payment_id
    };
  } catch (error) {
    console.error('Elsom error:', error);
    throw new Error('Elsom төлөм катасы');
  }
}