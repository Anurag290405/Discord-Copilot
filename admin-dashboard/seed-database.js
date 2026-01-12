/**
 * Database Seeding Script
 * Run: node seed-database.js
 * Populates Supabase with sample data for dashboard testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Insert System Instructions
    console.log('📝 Inserting system instructions...');
    const { data: existingInstructions } = await supabase
      .from('system_instructions')
      .select('*')
      .eq('is_active', true)
      .single();

    if (existingInstructions) {
      console.log('   ℹ️  Active instructions already exist, updating...');
      const { error: updateError } = await supabase
        .from('system_instructions')
        .update({
          instructions: `You are a helpful Discord bot assistant. Your purpose is to:
- Answer questions clearly and concisely
- Help users with their tasks
- Maintain a friendly and professional tone
- Remember context from previous messages in the conversation

When responding:
1. Be direct and helpful
2. Use formatting when appropriate (code blocks, lists, etc.)
3. Ask clarifying questions if needed
4. Stay on topic and relevant to the conversation`,
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true);

      if (updateError) throw updateError;
      console.log('   ✅ System instructions updated\n');
    } else {
      const { error: insertError } = await supabase
        .from('system_instructions')
        .insert({
          instructions: `You are a helpful Discord bot assistant. Your purpose is to:
- Answer questions clearly and concisely
- Help users with their tasks
- Maintain a friendly and professional tone
- Remember context from previous messages in the conversation

When responding:
1. Be direct and helpful
2. Use formatting when appropriate (code blocks, lists, etc.)
3. Ask clarifying questions if needed
4. Stay on topic and relevant to the conversation`,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
      console.log('   ✅ System instructions created\n');
    }

    // 2. Insert Sample Channels
    console.log('🔊 Inserting sample channels...');
    const sampleChannels = [
      {
        channel_id: '1234567890123456789',
        channel_name: 'general',
        server_id: '9876543210987654321',
        server_name: 'Test Server',
        is_active: true
      },
      {
        channel_id: '2345678901234567890',
        channel_name: 'bot-commands',
        server_id: '9876543210987654321',
        server_name: 'Test Server',
        is_active: true
      },
      {
        channel_id: '3456789012345678901',
        channel_name: 'help-desk',
        server_id: '8765432109876543210',
        server_name: 'Support Server',
        is_active: true
      },
      {
        channel_id: '4567890123456789012',
        channel_name: 'development',
        server_id: '7654321098765432109',
        server_name: 'Dev Server',
        is_active: true
      }
    ];

    for (const channel of sampleChannels) {
      // Check if channel already exists
      const { data: existing } = await supabase
        .from('allowed_channels')
        .select('*')
        .eq('channel_id', channel.channel_id)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('allowed_channels')
          .insert(channel);

        if (error) {
          console.log(`   ⚠️  Failed to insert channel ${channel.channel_name}: ${error.message}`);
        } else {
          console.log(`   ✅ Added channel: ${channel.channel_name} (${channel.channel_id})`);
        }
      } else {
        console.log(`   ℹ️  Channel ${channel.channel_name} already exists, skipping`);
      }
    }
    console.log();

    // 3. Insert Sample Conversation Memories
    console.log('💭 Inserting sample conversation memories...');
    const sampleMemories = [
      {
        channel_id: '1234567890123456789',
        summary: 'User asked about JavaScript async/await patterns. Bot explained promises and error handling. Discussion about best practices for API calls.',
        recent_messages: [
          { role: 'user', content: 'How do I use async/await in JavaScript?', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { role: 'assistant', content: 'Async/await is a way to handle asynchronous operations...', timestamp: new Date(Date.now() - 3500000).toISOString() },
          { role: 'user', content: 'What about error handling?', timestamp: new Date(Date.now() - 3000000).toISOString() },
          { role: 'assistant', content: 'You should use try/catch blocks with async/await...', timestamp: new Date(Date.now() - 2900000).toISOString() }
        ],
        message_count: 8,
        last_message_at: new Date(Date.now() - 2900000).toISOString()
      },
      {
        channel_id: '2345678901234567890',
        summary: 'User requested help with bot commands. Bot listed available commands and their syntax. User tested several commands successfully.',
        recent_messages: [
          { role: 'user', content: 'What commands are available?', timestamp: new Date(Date.now() - 7200000).toISOString() },
          { role: 'assistant', content: 'Here are the available commands: !help, !status, !ping...', timestamp: new Date(Date.now() - 7100000).toISOString() },
          { role: 'user', content: 'How do I use !status?', timestamp: new Date(Date.now() - 6800000).toISOString() },
          { role: 'assistant', content: 'The !status command shows the current bot status...', timestamp: new Date(Date.now() - 6700000).toISOString() }
        ],
        message_count: 12,
        last_message_at: new Date(Date.now() - 6700000).toISOString()
      },
      {
        channel_id: '3456789012345678901',
        summary: 'Technical support conversation about database connection issues. Bot provided troubleshooting steps. Issue was resolved by checking connection string.',
        recent_messages: [
          { role: 'user', content: 'My database connection keeps failing', timestamp: new Date(Date.now() - 10800000).toISOString() },
          { role: 'assistant', content: 'Let\'s troubleshoot this. First, check your connection string...', timestamp: new Date(Date.now() - 10700000).toISOString() },
          { role: 'user', content: 'Found the issue, wrong port number!', timestamp: new Date(Date.now() - 10200000).toISOString() },
          { role: 'assistant', content: 'Great! Glad you found it. Make sure to save the correct config.', timestamp: new Date(Date.now() - 10100000).toISOString() }
        ],
        message_count: 15,
        last_message_at: new Date(Date.now() - 10100000).toISOString()
      },
      {
        channel_id: '4567890123456789012',
        summary: 'Discussion about React hooks and state management. User learning about useEffect and its dependencies. Bot explained common pitfalls.',
        recent_messages: [
          { role: 'user', content: 'When should I use useEffect?', timestamp: new Date(Date.now() - 14400000).toISOString() },
          { role: 'assistant', content: 'useEffect is for side effects like data fetching, subscriptions...', timestamp: new Date(Date.now() - 14300000).toISOString() },
          { role: 'user', content: 'What about the dependency array?', timestamp: new Date(Date.now() - 14000000).toISOString() },
          { role: 'assistant', content: 'The dependency array controls when the effect runs...', timestamp: new Date(Date.now() - 13900000).toISOString() }
        ],
        message_count: 20,
        last_message_at: new Date(Date.now() - 13900000).toISOString()
      }
    ];

    for (const memory of sampleMemories) {
      // Check if memory already exists
      const { data: existing } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('channel_id', memory.channel_id)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('conversation_memory')
          .insert(memory);

        if (error) {
          console.log(`   ⚠️  Failed to insert memory for channel ${memory.channel_id}: ${error.message}`);
        } else {
          console.log(`   ✅ Added memory for channel: ${memory.channel_id} (${memory.message_count} messages)`);
        }
      } else {
        console.log(`   ℹ️  Memory for channel ${memory.channel_id} already exists, skipping`);
      }
    }
    console.log();

    // Summary
    console.log('📊 Fetching final counts...');
    const { count: channelCount } = await supabase
      .from('allowed_channels')
      .select('*', { count: 'exact', head: true });

    const { count: memoryCount } = await supabase
      .from('conversation_memory')
      .select('*', { count: 'exact', head: true });

    console.log(`   📝 System instructions: ✅ Active`);
    console.log(`   🔊 Allowed channels: ${channelCount || 0}`);
    console.log(`   💭 Conversation memories: ${memoryCount || 0}`);
    console.log();
    console.log('✅ Database seeding complete!\n');
    console.log('🌐 Open http://localhost:3000 to view the dashboard\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
