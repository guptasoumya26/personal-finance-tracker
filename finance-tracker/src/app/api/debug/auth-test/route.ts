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
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test 1: Check environment variables
  try {
    results.tests.envVarsExist = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_URL: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
      SUPABASE_ANON_KEY: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
    };
  } catch (error) {
    results.tests.envVarsExist = { error: error instanceof Error ? error.message : 'Unknown error' };
  }

  // Test 2: Try to import supabase client
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    results.tests.supabaseImport = '✅ Success';

    // Test 3: Try a simple query
    try {
      const { data, error } = await supabaseAdmin.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        results.tests.supabaseQuery = `❌ Error: ${error.message}`;
      } else {
        results.tests.supabaseQuery = `✅ Success (${data} users)`;
      }
    } catch (queryError) {
      results.tests.supabaseQuery = `❌ Error: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`;
    }
  } catch (importError) {
    results.tests.supabaseImport = `❌ Failed: ${importError instanceof Error ? importError.message : 'Unknown error'}`;
  }

  // Test 4: Try to import AuthService
  try {
    const { AuthService } = await import('@/lib/auth');
    results.tests.authServiceImport = '✅ Success';

    // Test 5: Try to get a user
    try {
      const user = await AuthService.getUserByUsername('admin');
      results.tests.getUserQuery = user ? '✅ Found user: admin' : '❌ User not found';
    } catch (getUserError) {
      results.tests.getUserQuery = `❌ Error: ${getUserError instanceof Error ? getUserError.message : 'Unknown error'}`;
    }
  } catch (authImportError) {
    results.tests.authServiceImport = `❌ Failed: ${authImportError instanceof Error ? authImportError.message : 'Unknown error'}`;
  }

  return NextResponse.json(results);
}
