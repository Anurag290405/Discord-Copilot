import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/memory/[channelId]
 * Get conversation memory for a specific channel
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;

    if (!channelId || channelId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from('conversation_memory')
      .select('*')
      .eq('channel_id', channelId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Memory not found for this channel' },
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
    console.error('Error fetching memory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/memory/[channelId]
 * Reset conversation memory for a specific channel
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;

    if (!channelId || channelId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Call the database function to reset memory
    const { data, error } = await supabaseAdmin()
      .rpc('reset_conversation_memory', { channel_id_param: channelId });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // If memory exists, return success. If not, also return success (idempotent)
    return NextResponse.json(
      {
        data,
        message: 'Conversation memory reset successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting memory:', error);
    return NextResponse.json(
      { error: 'Failed to reset memory' },
      { status: 500 }
    );
  }
}
