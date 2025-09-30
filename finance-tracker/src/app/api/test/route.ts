import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SIMPLE TEST ENDPOINT ===');

    // Test 1: Environment variables
    const envTest = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    console.log('Environment variables:', envTest);

    // Test 2: Simple Supabase query
    let dbTest = 'FAILED';
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      dbTest = error ? `ERROR: ${error.message}` : `SUCCESS: ${data?.length || 0} rows`;
      console.log('Database test:', dbTest);
    } catch (error) {
      dbTest = `EXCEPTION: ${error}`;
      console.log('Database exception:', error);
    }

    // Test 3: Check for auth cookie
    const authCookie = request.cookies.get('auth-token');
    const authTest = authCookie ? 'COOKIE_PRESENT' : 'NO_COOKIE';
    console.log('Auth test:', authTest);

    const result = {
      timestamp: new Date().toISOString(),
      environment: envTest,
      database: dbTest,
      authentication: authTest,
      url: request.url
    };

    console.log('Test result:', result);

    return NextResponse.json({
      success: true,
      test: result
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}