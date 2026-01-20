import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// POST /api/payments - Create payment
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, method, returnUrl } = body;

  // Validate method
  const validMethods = ['mbank', 'elsom', 'odengi', 'balance', 'cash'];
  if (!validMethods.includes(method)) {
    return NextResponse.json({ error: 'Туура эмес төлөм методу' }, { status: 400 });
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .in('status', ['pending', 'awaiting_payment'])
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
      currency: 'KGS',
      method,
      status: 'pending',
      description: `Буйрутма #${order.order_number}`
    })
    .select()
    .single();

  if (paymentError) {
    console.error('Payment creation error:', paymentError);
    return NextResponse.json({ error: 'Төлөм түзүүдө ката' }, { status: 500 });
  }

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'awaiting_payment',
      payment_method: method
    })
    .eq('id', orderId);

  // Process based on method
  let paymentResult;

  switch (method) {
    case 'mbank':
      paymentResult = await initiateMbankPayment(payment, order, returnUrl);
      break;

    case 'elsom':
      paymentResult = await initiateElsomPayment(payment, order, returnUrl);
      break;

    case 'odengi':
      paymentResult = await initiateODengiPayment(payment, order, returnUrl);
      break;

    case 'balance':
      // Pay from user's coin balance
      const { data: userData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', user.id)
        .single();

      const coinsNeeded = Math.ceil(order.total_amount); // 1 coin = 1 som

      if ((userData?.coins || 0) < coinsNeeded) {
        // Update payment as failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment.id);

        return NextResponse.json({
          error: 'Баланс жетишсиз',
          required: coinsNeeded,
          available: userData?.coins || 0
        }, { status: 400 });
      }

      // Deduct coins
      await supabase
        .from('users')
        .update({ coins: (userData?.coins || 0) - coinsNeeded })
        .eq('id', user.id);

      // Complete payment
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      // Update order
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_id: payment.id,
          payment_status: 'completed'
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        message: 'Төлөм ийгиликтүү аяктады!',
        payment: { ...payment, status: 'completed' },
        redirectUrl: `${returnUrl}?status=success&order=${order.order_number}`
      });

    case 'cash':
      // Cash on delivery - mark as pending
      await supabase
        .from('payments')
        .update({
          status: 'pending',
          metadata: { type: 'cash_on_delivery' }
        })
        .eq('id', payment.id);

      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'cod' // Cash on delivery
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        message: 'Буйрутма кабыл алынды! Накталай төлөйсүз.',
        payment,
        redirectUrl: `${returnUrl}?status=success&order=${order.order_number}&method=cash`
      });

    default:
      return NextResponse.json({ error: 'Туура эмес төлөм методу' }, { status: 400 });
  }

  // Update payment with provider data
  if (paymentResult.transactionId) {
    await supabase
      .from('payments')
      .update({
        status: 'processing',
        provider_id: paymentResult.transactionId,
        provider_response: paymentResult
      })
      .eq('id', payment.id);
  }

  return NextResponse.json({
    success: true,
    paymentId: payment.id,
    ...paymentResult
  });
}

// GET /api/payments - Get user payments
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');

  let query = supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (orderId) {
    query = query.eq('order_id', orderId);
  }

  const { data: payments, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ payments });
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

  // Generate signature
  const timestamp = Date.now().toString();
  const signData = `${merchantId}${payment.amount}${order.order_number}${timestamp}`;
  const signature = secretKey
    ? crypto.createHmac('sha256', secretKey).update(signData).digest('hex')
    : '';

  if (!merchantId || !secretKey) {
    // Development mode - return mock payment URL
    const mockPaymentId = `mbank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      paymentUrl: `/checkout/pay?provider=mbank&payment=${payment.id}&mock=true`,
      transactionId: mockPaymentId,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mbank:${mockPaymentId}`,
      mock: true,
      instructions: [
        '1. Mbank колдонмосун ачыңыз',
        '2. "Төлөмдөр" бөлүмүнө өтүңүз',
        '3. QR кодду сканерлеңиз же төлөм кодун киргизиңиз',
        `4. Сумма: ${payment.amount} сом`
      ]
    };
  }

  // Real Mbank API call
  try {
    const response = await fetch(`${apiUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
        'X-Timestamp': timestamp,
        'X-Signature': signature
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

    if (!response.ok) {
      throw new Error(data.message || 'Mbank API error');
    }

    return {
      paymentUrl: data.payment_url,
      transactionId: data.transaction_id,
      qrCode: data.qr_code
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
    // Development mode
    const mockPaymentId = `elsom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      paymentUrl: `/checkout/pay?provider=elsom&payment=${payment.id}&mock=true`,
      transactionId: mockPaymentId,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=elsom:${mockPaymentId}`,
      mock: true,
      instructions: [
        '1. Elsom колдонмосун ачыңыз',
        '2. "Төлөө" баскычын басыңыз',
        '3. QR кодду сканерлеңиз',
        `4. Сумма: ${payment.amount} сом`
      ]
    };
  }

  // Real Elsom API call
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

    if (!response.ok) {
      throw new Error(data.message || 'Elsom API error');
    }

    return {
      paymentUrl: data.redirect_url,
      transactionId: data.payment_id,
      qrCode: data.qr_code
    };
  } catch (error) {
    console.error('Elsom error:', error);
    throw new Error('Elsom төлөм катасы');
  }
}

// O!Dengi payment integration
async function initiateODengiPayment(
  payment: { id: string; amount: number },
  order: { order_number: string },
  returnUrl: string
) {
  const merchantId = process.env.ODENGI_MERCHANT_ID;
  const secretKey = process.env.ODENGI_SECRET_KEY;
  const apiUrl = process.env.ODENGI_API_URL || 'https://api.odengi.kg';

  if (!merchantId || !secretKey) {
    // Development mode
    const mockPaymentId = `odengi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      paymentUrl: `/checkout/pay?provider=odengi&payment=${payment.id}&mock=true`,
      transactionId: mockPaymentId,
      ussdCode: `*880*${mockPaymentId.slice(-8)}#`,
      mock: true,
      instructions: [
        '1. O! телефонуңуздан USSD код терүүңүз',
        `2. Код: *880*${mockPaymentId.slice(-8)}#`,
        '3. Же O!Dengi колдонмосунан төлөңүз',
        `4. Сумма: ${payment.amount} сом`
      ]
    };
  }

  // Real O!Dengi API call
  try {
    const response = await fetch(`${apiUrl}/api/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${merchantId}:${secretKey}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: payment.amount,
        order_id: order.order_number,
        description: `Pinduo Shop #${order.order_number}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/odengi`,
        return_url: returnUrl
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'O!Dengi API error');
    }

    return {
      paymentUrl: data.payment_url,
      transactionId: data.transaction_id,
      ussdCode: data.ussd_code
    };
  } catch (error) {
    console.error('O!Dengi error:', error);
    throw new Error('O!Dengi төлөм катасы');
  }
}
