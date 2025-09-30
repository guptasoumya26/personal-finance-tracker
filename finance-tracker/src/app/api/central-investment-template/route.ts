import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, createAuthErrorResponse } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data, error } = await supabase
      .from('central_investment_templates')
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
    console.error('Error fetching central investment template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch central investment template' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Attempting to create investment template...');

    const user = await requireAuth(request);
    console.log('User authenticated:', { id: user.id, username: user.username });

    const body = await request.json();
    const { items } = body;
    console.log('Request body items:', items);

    const { data, error } = await supabase
      .from('central_investment_templates')
      .insert({
        user_id: user.id,
        items: items || []
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Investment template created successfully:', data);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      console.error('Authentication failed');
      return createAuthErrorResponse(error, 401);
    }
    console.error('Error creating central investment template:', error);
    return NextResponse.json(
      {
        error: 'Failed to create central investment template',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
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

    // First, check if a template exists for this user
    const { data: existingTemplate } = await supabase
      .from('central_investment_templates')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'No central investment template found to update' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('central_investment_templates')
      .update({
        items: items || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', existingTemplate.id)
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
    console.error('Error updating central investment template:', error);
    return NextResponse.json(
      {
        error: 'Failed to update central investment template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}