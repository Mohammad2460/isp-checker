import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const ispFilter = searchParams.get('isp');

    // By-service aggregate (always 10 rows max)
    const { data: serviceStats, error: serviceError } = await supabase
      .from('service_stats')
      .select('*')
      .order('blocked_pct', { ascending: false });

    if (serviceError) {
      console.error('Service stats error:', serviceError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // By-ISP breakdown (filterable)
    let ispQuery = supabase
      .from('service_isp_stats')
      .select('*')
      .order('blocked_pct', { ascending: false });

    if (ispFilter) {
      ispQuery = ispQuery.ilike('isp', `%${ispFilter}%`);
    }

    const { data: ispStats, error: ispError } = await ispQuery;

    if (ispError) {
      console.error('ISP stats error:', ispError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Total checks in last 24h
    const { count } = await supabase
      .from('checks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      serviceStats: serviceStats ?? [],
      ispStats: ispStats ?? [],
      totalChecks: count ?? 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
