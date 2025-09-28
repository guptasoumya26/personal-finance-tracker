import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('central_templates')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error('Error fetching central template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch central template' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    // Check if template already exists
    const { data: existing } = await supabase
      .from('central_templates')
      .select('id')
      .single();

    let result;
    if (existing) {
      // Update existing template
      result = await supabase
        .from('central_templates')
        .update({ items, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new template
      result = await supabase
        .from('central_templates')
        .insert({ items })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error saving central template:', error);
    return NextResponse.json(
      { error: 'Failed to save central template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    // First, get the existing template to get its ID
    const { data: existing, error: fetchError } = await supabase
      .from('central_templates')
      .select('id')
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
    const { data, error } = await supabase
      .from('central_templates')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating central template:', error);
    return NextResponse.json(
      { error: 'Failed to update central template' },
      { status: 500 }
    );
  }
}