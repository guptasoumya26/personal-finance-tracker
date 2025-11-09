import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { entries } = body; // Array of { id, display_order }

    if (!Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'entries must be an array' },
        { status: 400 }
      );
    }

    // Update display_order for each credit card entry
    const updatePromises = entries.map(({ id, display_order }) =>
      supabaseAdmin
        .from('credit_card_entries')
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
    console.error('Error reordering credit card entries:', error);
    return NextResponse.json(
      { error: 'Failed to reorder credit card entries' },
      { status: 500 }
    );
  }
}
