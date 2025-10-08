import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data, error } = await supabaseAdmin
      .from('central_templates')
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
    console.error('Error fetching central template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch central template' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { items } = body;

    // Check if template already exists for this user
    const { data: existing } = await supabaseAdmin
      .from('central_templates')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existing) {
      // Update existing template
      result = await supabaseAdmin
        .from('central_templates')
        .update({ items, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new template
      result = await supabaseAdmin
        .from('central_templates')
        .insert({ user_id: user.id, items })
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
    console.error('Error saving central template:', error);
    return NextResponse.json(
      {
        error: 'Failed to save central template'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { items } = body;

    // First, get the existing template for this user
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('central_templates')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'No central template found to update' },
        { status: 404 }
      );
    }

    // Update the template with the specific ID
    const { data, error } = await supabaseAdmin
      .from('central_templates')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .eq('user_id', user.id) // Double-check user ownership
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
    console.error('Error updating central template:', error);
    return NextResponse.json(
      {
        error: 'Failed to update central template'
      },
      { status: 500 }
    );
  }
}