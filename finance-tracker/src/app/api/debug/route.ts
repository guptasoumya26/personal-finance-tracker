import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG API ENDPOINT ===');

    // Test 1: Check if user authentication works
    let authStatus = 'FAILED';
    let user = null;
    try {
      user = await getCurrentUser(request);
      authStatus = user ? 'SUCCESS' : 'NO_USER';
      console.log('Auth test:', { authStatus, user: user ? { id: user.id, username: user.username } : null });
    } catch (error) {
      console.log('Auth error:', error);
    }

    // Test 2: Check if basic supabase connection works
    let supabaseStatus = 'FAILED';
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      supabaseStatus = error ? `ERROR: ${error.message}` : 'SUCCESS';
      console.log('Supabase test:', { supabaseStatus, error });
    } catch (error) {
      console.log('Supabase connection error:', error);
    }

    // Test 3: Check if central_templates table exists
    let centralTemplatesTableStatus = 'FAILED';
    try {
      const { data, error } = await supabase.from('central_templates').select('count').limit(1);
      centralTemplatesTableStatus = error ? `ERROR: ${error.message}` : 'SUCCESS';
      console.log('Central templates table test:', { centralTemplatesTableStatus, error });
    } catch (error) {
      console.log('Central templates table error:', error);
    }

    // Test 4: Check if central_investment_templates table exists
    let investmentTemplatesTableStatus = 'FAILED';
    try {
      const { data, error } = await supabase.from('central_investment_templates').select('count').limit(1);
      investmentTemplatesTableStatus = error ? `ERROR: ${error.message}` : 'SUCCESS';
      console.log('Investment templates table test:', { investmentTemplatesTableStatus, error });
    } catch (error) {
      console.log('Investment templates table error:', error);
    }

    // Test 5: Check environment variables
    const envCheck = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    const diagnostics = {
      timestamp: new Date().toISOString(),
      authentication: {
        status: authStatus,
        user: user ? { id: user.id, username: user.username, role: user.role } : null
      },
      database: {
        supabase_connection: supabaseStatus,
        central_templates_table: centralTemplatesTableStatus,
        investment_templates_table: investmentTemplatesTableStatus
      },
      environment: envCheck
    };

    console.log('=== FULL DIAGNOSTICS ===', JSON.stringify(diagnostics, null, 2));

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
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