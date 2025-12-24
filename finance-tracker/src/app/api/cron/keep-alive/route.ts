import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Keep-Alive Cron Job
 *
 * This endpoint is called by Vercel Cron and GitHub Actions to keep the Supabase database active
 * and prevent automatic pausing on the free tier (requires activity every 7 days).
 *
 * Performs real SELECT, INSERT, and DELETE operations to generate genuine database activity.
 * - Called every 4 hours via GitHub Actions (primary)
 * - Called daily at midnight via Vercel Cron (backup)
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Verify this is called by Vercel Cron or is a legitimate request
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('[Keep-Alive] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Health Check] Starting health check at', new Date().toISOString());

    // Perform actual SELECT query to generate real database activity
    const { data: records, error: selectError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (selectError) {
      console.error('[Health Check] SELECT query failed:', selectError);
      throw selectError;
    }

    console.log('[Health Check] SELECT query successful, found', records?.length || 0, 'records');

    // Perform INSERT to health_checks table to ensure write activity
    const responseTimeMs = Date.now() - startTime;
    const { error: insertError } = await supabaseAdmin
      .from('health_checks')
      .insert({
        status: 'ok',
        message: 'Database active - read and write operations successful',
        response_time_ms: responseTimeMs,
        checked_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('[Health Check] INSERT to health_checks failed:', insertError);
      // Don't fail the health check if insert fails (table might not exist yet)
    } else {
      console.log('[Health Check] INSERT to health_checks successful');
    }

    // Cleanup old health check records (keep last 7 days)
    const { error: deleteError } = await supabaseAdmin
      .from('health_checks')
      .delete()
      .lt('checked_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (deleteError) {
      console.warn('[Health Check] Cleanup of old records failed:', deleteError);
    }

    const totalResponseTime = Date.now() - startTime;

    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      operations: {
        select: 'success',
        insert: insertError ? 'failed' : 'success',
        cleanup: deleteError ? 'failed' : 'success'
      },
      response_time_ms: totalResponseTime,
      message: 'Health check completed successfully'
    };

    console.log('[Health Check] Completed successfully in', totalResponseTime, 'ms');

    return NextResponse.json(response);
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[Health Check] Exception:', errorMessage);

    // Try to log the failure to database
    try {
      await supabaseAdmin
        .from('health_checks')
        .insert({
          status: 'error',
          message: errorMessage,
          response_time_ms: responseTimeMs,
          checked_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('[Health Check] Failed to log error to database:', logError);
    }

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: errorMessage,
      response_time_ms: responseTimeMs
    }, { status: 500 });
  }
}
