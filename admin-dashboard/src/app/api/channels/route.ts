import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/channels
 * List all allowed channels
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from('allowed_channels')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/channels
 * Add a new allowed channel
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channel_id, channel_name, server_id, server_name } = body;

    if (!channel_id || channel_id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // Validate Discord channel ID format (19 digits)
    if (!/^\d{18,20}$/.test(channel_id)) {
      return NextResponse.json(
        { error: 'Invalid Discord channel ID format. Must be 18-20 digits.' },
        { status: 400 }
      );
    }

    // Check if channel already exists
    const { data: existing } = await supabaseAdmin()
      .from('allowed_channels')
      .select('id')
      .eq('channel_id', channel_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Channel already in allow-list' },
        { status: 409 }
      );
    }

    // Add new channel
    const { data, error } = await supabaseAdmin()
      .from('allowed_channels')
      .insert([
        {
          channel_id: channel_id.trim(),
          channel_name: channel_name?.trim() || null,
          server_id: server_id?.trim() || null,
          server_name: server_name?.trim() || null,
          is_active: true
        }
      ])
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
        message: 'Channel added to allow-list successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding channel:', error);
    return NextResponse.json(
      { error: 'Failed to add channel' },
      { status: 500 }
    );
  }
}
