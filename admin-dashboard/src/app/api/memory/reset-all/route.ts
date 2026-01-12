import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * POST /api/memory/reset-all
 * Reset all conversation memories
 * ⚠️  DANGEROUS: This clears all conversation history
 */
export async function POST(request: Request) {
  try {
    // Get all memories to reset
    const { data: allMemories, error: fetchError } = await supabaseAdmin()
      .from('conversation_memory')
      .select('channel_id');

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      );
    }

    if (!allMemories || allMemories.length === 0) {
      return NextResponse.json(
        {
          data: { reset_count: 0 },
          message: 'No memories to reset'
        },
        { status: 200 }
      );
    }

    // Reset all memories
    const { data, error } = await supabaseAdmin()
      .from('conversation_memory')
      .update({
        summary: '',
        message_count: 0,
        recent_messages: [],
        updated_at: new Date().toISOString()
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data: {
          reset_count: allMemories.length,
          message: `Reset ${allMemories.length} conversation memories`
        },
        message: 'All memories reset successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting all memories:', error);
    return NextResponse.json(
      { error: 'Failed to reset all memories' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/memory/reset-all
 * Get stats about reset operation (without actually resetting)
 */
export async function GET() {
  try {
    const { data: allMemories, error } = await supabaseAdmin()
      .from('conversation_memory')
      .select('channel_id, message_count');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const totalMessages = allMemories?.reduce((sum, mem) => sum + (mem.message_count || 0), 0) || 0;

    return NextResponse.json(
      {
        data: {
          total_channels: allMemories?.length || 0,
          total_messages: totalMessages,
          message: 'Statistics about memories to be reset. Use POST to actually reset.'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching reset stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reset stats' },
      { status: 500 }
    );
  }
}
