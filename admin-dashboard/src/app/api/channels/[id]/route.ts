import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/channels/[id]
 * Remove a channel from allow-list
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by marking as inactive
    const { data, error } = await supabaseAdmin()
      .from('allowed_channels')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Channel not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data,
        message: 'Channel removed from allow-list'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json(
      { error: 'Failed to remove channel' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/channels/[id]
 * Get a specific channel details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from('allowed_channels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Channel not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
      { status: 500 }
    );
  }
}
