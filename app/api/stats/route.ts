import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const ispFilter = searchParams.get('isp');

    let query = supabase
      .from('service_isp_stats')
      .select('*')
      .order('blocked_pct', { ascending: false });

    if (ispFilter) {
      query = query.ilike('isp', `%${ispFilter}%`);
    }

    const { data: stats, error } = await query;

    if (error) {
      console.error('Stats query error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Count total checks in last 24h
    const { count } = await supabase
      .from('checks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      stats: stats ?? [],
      totalChecks: count ?? 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
