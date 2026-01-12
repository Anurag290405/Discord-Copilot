import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/memory
 * List all conversation memories
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // First, fetch conversation memories
    const { data: memories, error: memoryError, count } = await supabaseAdmin()
      .from('conversation_memory')
      .select('*', { count: 'exact' })
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (memoryError) {
      return NextResponse.json(
        { error: memoryError.message },
        { status: 400 }
      );
    }

    // Then fetch channel names for matching channel_ids
    const channelIds = memories?.map(m => m.channel_id).filter(Boolean) || [];
    const { data: channels } = await supabaseAdmin()
      .from('allowed_channels')
      .select('channel_id, channel_name')
      .in('channel_id', channelIds);

    // Create a map of channel_id to channel_name
    const channelMap = new Map(
      channels?.map(ch => [ch.channel_id, ch.channel_name]) || []
    );

    // Merge channel names into memory data
    const enrichedData = memories?.map(memory => ({
      ...memory,
      channel_name: channelMap.get(memory.channel_id) || null
    })) || [];

    return NextResponse.json(
      {
        data: enrichedData,
        pagination: {
          total: count,
          limit,
          offset,
          hasMore: count ? offset + limit < count : false
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memory/reset-all
 * Reset all conversation memories (handled in separate route)
 * This endpoint remains for compatibility
 */
export async function POST(request: Request) {
  try {
    // This would be called for reset-all, but we use separate route for clarity
    return NextResponse.json(
      { error: 'Use POST /api/memory/reset-all instead' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in memory POST:', error);
    return NextResponse.json(
      { error: 'Failed to process memory request' },
      { status: 500 }
    );
  }
}
