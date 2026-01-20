import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/seller/stats - Get seller dashboard statistics
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Get user's shop
  const { data: shop } = await supabase
    .from('shops')
    .select('id, total_sales, products_count, followers_count')
    .eq('owner_id', user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: 'Дүкөн табылган жок' }, { status: 404 });
  }

  // Get total orders count
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop.id);

  // Get pending orders count
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop.id)
    .eq('status', 'pending');

  // Get total products count (real count from products table)
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', shop.id)
    .eq('is_active', true);

  // Get total views across all products
  const { data: viewsData } = await supabase
    .from('products')
    .select('views')
    .eq('shop_id', shop.id);

  const totalViews = viewsData?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

  // Get today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todaySales } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('shop_id', shop.id)
    .gte('created_at', today.toISOString())
    .in('status', ['completed', 'delivered', 'shipped']);

  const todayRevenue = todaySales?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

  // Get this month's sales
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const { data: monthSales } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('shop_id', shop.id)
    .gte('created_at', monthStart.toISOString())
    .in('status', ['completed', 'delivered', 'shipped']);

  const monthRevenue = monthSales?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

  // Get weekly sales data for chart
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: weeklyOrders } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .eq('shop_id', shop.id)
    .gte('created_at', weekAgo.toISOString())
    .in('status', ['completed', 'delivered', 'shipped'])
    .order('created_at', { ascending: true });

  // Group by date
  const salesByDate: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    salesByDate[dateStr] = 0;
  }

  weeklyOrders?.forEach(order => {
    const dateStr = order.created_at.split('T')[0];
    if (salesByDate[dateStr] !== undefined) {
      salesByDate[dateStr] += order.total_amount || 0;
    }
  });

  const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
    date,
    amount
  }));

  return NextResponse.json({
    totalSales: shop.total_sales || 0,
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    totalProducts: productsCount || 0,
    totalViews,
    todayRevenue,
    monthRevenue,
    followers: shop.followers_count || 0,
    chartData
  });
}
