import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  // Require admin authentication
  try {
    await requireAdmin(request);
  } catch (error) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  try {
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length + ')' : '❌ Missing',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Set (length: ' + process.env.SUPABASE_ANON_KEY?.length + ')' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY?.length + ')' : '❌ Missing',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Set (length: ' + process.env.JWT_SECRET?.length + ')' : '❌ Missing',
      AUTH_USERNAME: process.env.AUTH_USERNAME ? '✅ Set' : '❌ Missing',
      AUTH_PASSWORD: process.env.AUTH_PASSWORD ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Check if JWT_SECRET is the literal command
    if (process.env.JWT_SECRET === '$(openssl rand -base64 32)') {
      envCheck.JWT_SECRET = '⚠️ SET TO LITERAL COMMAND STRING - NEEDS TO BE ACTUAL SECRET!';
    }

    return NextResponse.json({
      status: 'Environment check',
      variables: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
