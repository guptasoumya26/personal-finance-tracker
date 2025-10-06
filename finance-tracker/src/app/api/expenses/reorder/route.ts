import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { expenses } = body; // Array of { id, display_order }

    if (!Array.isArray(expenses)) {
      return NextResponse.json(
        { error: 'expenses must be an array' },
        { status: 400 }
      );
    }

    // Update display_order for each expense
    const updatePromises = expenses.map(({ id, display_order }) =>
      supabase
        .from('expenses')
        .update({ display_order })
        .eq('id', id)
        .eq('user_id', user.id)
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error reordering expenses:', error);
    return NextResponse.json(
      { error: 'Failed to reorder expenses' },
      { status: 500 }
    );
  }
}
