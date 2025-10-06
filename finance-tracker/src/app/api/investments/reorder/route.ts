import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { investments } = body; // Array of { id, display_order }

    if (!Array.isArray(investments)) {
      return NextResponse.json(
        { error: 'investments must be an array' },
        { status: 400 }
      );
    }

    // Update display_order for each investment
    const updatePromises = investments.map(({ id, display_order }) =>
      supabase
        .from('investments')
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
    console.error('Error reordering investments:', error);
    return NextResponse.json(
      { error: 'Failed to reorder investments' },
      { status: 500 }
    );
  }
}
