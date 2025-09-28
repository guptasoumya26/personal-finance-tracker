import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, month } = body;

    // Check if note already exists for this month
    const { data: existing } = await supabase
      .from('notes')
      .select('id')
      .eq('month', month)
      .single();

    let result;
    if (existing) {
      // Update existing note
      result = await supabase
        .from('notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new note
      result = await supabase
        .from('notes')
        .insert({ content, month })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error saving note:', error);
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { content, month } = body;

    const { data, error } = await supabase
      .from('notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('month', month)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}