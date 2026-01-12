// Test Supabase Connection - Discord Bot
// Run: node test-supabase.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection (Discord Bot)...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Please update .env with your Supabase credentials\n');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBotConnection() {
  try {
    // Test 1: Fetch system instructions (what bot needs most)
    console.log('Test 1: Fetching system instructions...');
    const { data: instructions, error: instrError } = await supabase
      .from('system_instructions')
      .select('instructions')
      .eq('is_active', true)
      .single();

    if (instrError) {
      console.error('❌ Failed:', instrError.message);
      return false;
    }

    console.log('✅ System Instructions retrieved');
    console.log(`   Length: ${instructions.instructions.length} characters`);
    console.log(`   Preview: ${instructions.instructions.substring(0, 100)}...`);
    console.log();

    // Test 2: Check allowed channels (bot needs this to filter messages)
    console.log('Test 2: Checking allowed channels...');
    const { data: channels, error: channelError } = await supabase
      .from('allowed_channels')
      .select('channel_id, channel_name')
      .eq('is_active', true);

    if (channelError) {
      console.error('❌ Failed:', channelError.message);
      return false;
    }

    console.log(`✅ Allowed Channels: ${channels.length} found`);
    if (channels.length === 0) {
      console.log('   ⚠️  Warning: No channels configured yet');
      console.log('   Add channels via admin dashboard before testing the bot');
    } else {
      channels.forEach(ch => {
        console.log(`   - ${ch.channel_name || 'Unnamed'} (${ch.channel_id})`);
      });
    }
    console.log();

    // Test 3: Test channel check function
    console.log('Test 3: Testing channel validation function...');
    const testChannelId = '1234567890123456789';
    const { data: isAllowed, error: checkError } = await supabase
      .rpc('is_channel_allowed', { channel_id_param: testChannelId });

    if (checkError) {
      console.error('❌ Failed:', checkError.message);
      return false;
    }

    console.log(`✅ Channel check function works`);
    console.log(`   Test channel ${testChannelId}: ${isAllowed ? 'ALLOWED' : 'NOT ALLOWED'}`);
    console.log();

    // Test 4: Test conversation memory access
    console.log('Test 4: Testing conversation memory...');
    const { data: memories, error: memError } = await supabase
      .from('conversation_memory')
      .select('channel_id, message_count, last_message_at')
      .limit(3);

    if (memError) {
      console.error('❌ Failed:', memError.message);
      return false;
    }

    console.log(`✅ Conversation memory accessible: ${memories.length} records`);
    if (memories.length === 0) {
      console.log('   (No conversations yet - this is normal)');
    }
    console.log();

    // Test 5: Test write permissions (create/update memory)
    console.log('Test 5: Testing write permissions...');
    const testChannelId2 = '9999999999999999999';
    const { error: writeError } = await supabase
      .from('conversation_memory')
      .upsert({
        channel_id: testChannelId2,
        summary: 'Test connection from bot',
        message_count: 0
      }, {
        onConflict: 'channel_id'
      });

    if (writeError) {
      console.error('❌ Failed:', writeError.message);
      return false;
    }

    console.log('✅ Write permissions confirmed');
    
    // Clean up test data
    await supabase
      .from('conversation_memory')
      .delete()
      .eq('channel_id', testChannelId2);
    
    console.log('   (Test data cleaned up)');
    console.log();

    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testBotConnection().then(success => {
  if (success) {
    console.log('🎉 All tests passed! Discord Bot can connect to Supabase.\n');
    console.log('Next steps:');
    console.log('1. Get your Discord bot token from Discord Developer Portal');
    console.log('2. Add DISCORD_TOKEN to .env file');
    console.log('3. Get OpenAI API key and add OPENAI_API_KEY to .env');
    console.log('4. Add at least one channel to allowed_channels via admin dashboard');
    console.log('5. Start the bot: npm start\n');
  } else {
    console.log('\n❌ Some tests failed. Please check your Supabase setup.\n');
    process.exit(1);
  }
});
