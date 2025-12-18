import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Fetch global note for this user (no month parameter needed)
    const { data, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { content, credit_card_tracker_title } = body;

    // Check if note already exists for this user (global note, no month)
    const { data: existing } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existing) {
      // Update existing note
      const updateData: { content: string; updated_at: string; credit_card_tracker_title?: string } = { content, updated_at: new Date().toISOString() };
      if (credit_card_tracker_title !== undefined) {
        updateData.credit_card_tracker_title = credit_card_tracker_title;
      }
      result = await supabaseAdmin
        .from('notes')
        .update(updateData)
        .eq('id', existing.id)
        .eq('user_id', user.id) // Double-check user ownership
        .select()
        .single();
    } else {
      // Create new note
      const insertData: { user_id: string; content: string; credit_card_tracker_title?: string } = { user_id: user.id, content };
      if (credit_card_tracker_title !== undefined) {
        insertData.credit_card_tracker_title = credit_card_tracker_title;
      }
      result = await supabaseAdmin
        .from('notes')
        .insert(insertData)
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
    console.error('Error saving note:', error);
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { content } = body;

    const { data, error } = await supabaseAdmin
      .from('notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('user_id', user.id) // Ensure user can only update their own notes
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
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}