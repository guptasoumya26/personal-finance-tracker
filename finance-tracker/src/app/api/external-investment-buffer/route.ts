import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    let query = supabase.from('external_investment_buffer').select('*').eq('user_id', user.id);

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error fetching external investment buffer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external investment buffer' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { description, amount, month } = body;

    const { data, error } = await supabase
      .from('external_investment_buffer')
      .insert({
        user_id: user.id,
        description,
        amount,
        month
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error creating external investment buffer:', error);
    return NextResponse.json(
      { error: 'Failed to create external investment buffer' },
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
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('external_investment_buffer')
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
    console.error('Error deleting external investment buffer:', error);
    return NextResponse.json(
      { error: 'Failed to delete external investment buffer' },
      { status: 500 }
    );
  }
}
