// Test Supabase Connection - Admin Dashboard
// Run: node test-supabase.js

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Please update .env.local with your Supabase credentials\n');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test 1: Check active config view
    console.log('Test 1: Checking active configuration...');
    const { data: config, error: configError } = await supabase
      .from('active_config')
      .select('*')
      .single();

    if (configError) {
      console.error('❌ Failed:', configError.message);
      return false;
    }

    console.log('✅ Active Config:', {
      instructionsLength: config.current_instructions?.length || 0,
      allowedChannels: config.allowed_channels_count,
      activeConversations: config.active_conversations
    });
    console.log();

    // Test 2: Check system instructions
    console.log('Test 2: Fetching system instructions...');
    const { data: instructions, error: instrError } = await supabase
      .from('system_instructions')
      .select('*')
      .eq('is_active', true)
      .single();

    if (instrError) {
      console.error('❌ Failed:', instrError.message);
      return false;
    }

    console.log('✅ System Instructions found');
    console.log(`   Instructions: ${instructions.instructions.substring(0, 80)}...`);
    console.log();

    // Test 3: List allowed channels
    console.log('Test 3: Checking allowed channels...');
    const { data: channels, error: channelError } = await supabase
      .from('allowed_channels')
      .select('*');

    if (channelError) {
      console.error('❌ Failed:', channelError.message);
      return false;
    }

    console.log(`✅ Allowed Channels: ${channels.length} found`);
    if (channels.length > 0) {
      channels.forEach(ch => {
        console.log(`   - ${ch.channel_name || 'Unnamed'} (${ch.channel_id})`);
      });
    } else {
      console.log('   (No channels added yet - this is normal for initial setup)');
    }
    console.log();

    // Test 4: Check conversation memory
    console.log('Test 4: Checking conversation memory...');
    const { data: memories, error: memError } = await supabase
      .from('conversation_memory')
      .select('*')
      .limit(5);

    if (memError) {
      console.error('❌ Failed:', memError.message);
      return false;
    }

    console.log(`✅ Conversation Memories: ${memories.length} found`);
    console.log();

    // Test 5: Test helper function
    console.log('Test 5: Testing helper function...');
    const { data: activeInstructions, error: funcError } = await supabase
      .rpc('get_active_system_instructions');

    if (funcError) {
      console.error('❌ Failed:', funcError.message);
      return false;
    }

    console.log('✅ Helper function works');
    console.log(`   Result: ${activeInstructions?.substring(0, 60)}...`);
    console.log();

    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 All tests passed! Supabase is connected and working.\n');
    console.log('Next steps:');
    console.log('1. Start the admin dashboard: npm run dev');
    console.log('2. Test the Discord bot connection');
    console.log('3. Begin implementing API routes\n');
  } else {
    console.log('\n❌ Some tests failed. Please check your Supabase setup.\n');
    process.exit(1);
  }
});
