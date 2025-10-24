import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    // First, get the current is_completed status
    const { data: expense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('is_completed')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Toggle the is_completed status
    const newStatus = !expense.is_completed;

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .update({ is_completed: newStatus })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own expenses
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error toggling expense completion:', error);
    return NextResponse.json(
      { error: 'Failed to toggle expense completion' },
      { status: 500 }
    );
  }
}
