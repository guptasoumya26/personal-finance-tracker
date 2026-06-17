import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    let query = supabaseAdmin.from('net_worth_entries').select('*').eq('user_id', user.id);

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query.order('month', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error fetching net worth entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch net worth entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { amount, month } = body;

    // Upsert: one net worth entry per user per month
    const { data: existing } = await supabaseAdmin
      .from('net_worth_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', month)
      .single();

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from('net_worth_entries')
        .update({ amount, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('net_worth_entries')
        .insert({ user_id: user.id, amount, month })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error saving net worth entry:', error);
    return NextResponse.json(
      { error: 'Failed to save net worth entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Net worth entry ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('net_worth_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error deleting net worth entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete net worth entry' },
      { status: 500 }
    );
  }
}
