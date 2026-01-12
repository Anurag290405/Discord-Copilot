import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/instructions
 * Fetch current active system instructions
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from('system_instructions')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching instructions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructions
 * Update system instructions
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instructions } = body;

    if (!instructions || instructions.trim().length === 0) {
      return NextResponse.json(
        { error: 'Instructions cannot be empty' },
        { status: 400 }
      );
    }

    // Update the active instruction
    const { data, error } = await supabaseAdmin()
      .from('system_instructions')
      .update({
        instructions: instructions.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data,
        message: 'Instructions updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating instructions:', error);
    return NextResponse.json(
      { error: 'Failed to update instructions' },
      { status: 500 }
    );
  }
}
