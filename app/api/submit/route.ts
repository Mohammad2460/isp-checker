import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createServerClient } from '@/lib/supabase';

interface ServiceResult {
  serviceName: string;
  serviceUrl: string;
  isBlocked: boolean;
  responseTimeMs: number | null;
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') ?? '0.0.0.0';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const results: ServiceResult[] = body.results;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'Invalid results' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const supabase = createServerClient();

    // Rate limit check: 1 check per IP per hour
    const { data: rateLimit } = await supabase
      .from('rate_limits')
      .select('last_check_at')
      .eq('ip_hash', ipHash)
      .single();

    if (rateLimit) {
      const lastCheck = new Date(rateLimit.last_check_at);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (lastCheck > hourAgo) {
        const retryAfter = Math.ceil(
          (lastCheck.getTime() + 60 * 60 * 1000 - Date.now()) / 1000
        );
        return NextResponse.json(
          { error: 'rate_limited', retryAfter },
          { status: 429 }
        );
      }
    }

    // ISP lookup via ip-api.com
    let isp = 'Unknown ISP';
    let city = '';
    let state = '';
    try {
      const ipApiRes = await fetch(
        `http://ip-api.com/json/${ip}?fields=isp,city,regionName`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (ipApiRes.ok) {
        const ipData = await ipApiRes.json();
        isp = ipData.isp ?? 'Unknown ISP';
        city = ipData.city ?? '';
        state = ipData.regionName ?? '';
      }
    } catch {
      // ISP lookup failed — continue without it
    }

    // Insert check results
    const rows = results.map((r) => ({
      ip_hash: ipHash,
      isp,
      city,
      state,
      service_name: r.serviceName,
      service_url: r.serviceUrl,
      is_blocked: r.isBlocked,
      response_time_ms: r.responseTimeMs ?? null,
    }));

    const { error: insertError } = await supabase.from('checks').insert(rows);
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Upsert rate limit
    await supabase.from('rate_limits').upsert({
      ip_hash: ipHash,
      last_check_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, isp, city, state });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
