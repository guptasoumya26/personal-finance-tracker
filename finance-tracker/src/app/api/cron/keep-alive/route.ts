import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Keep-Alive Cron Job
 *
 * This endpoint is called by Vercel Cron to keep the Supabase database active
 * and prevent automatic pausing on the free tier (requires activity every 7 days).
 *
 * Performs a lightweight query to show database activity.
 * Called every 6 days via Vercel Cron (see vercel.json).
 */
export async function GET(request: Request) {
  try {
    // Verify this is called by Vercel Cron (security check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Perform a lightweight query to show database activity
    // Just count users - this is fast and doesn't return sensitive data
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[Keep-Alive] Database query failed:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database query failed',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    console.log(`[Keep-Alive] Success - Database active with ${count} users`);

    return NextResponse.json({
      success: true,
      message: 'Database keep-alive successful',
      userCount: count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Keep-Alive] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
