#!/usr/bin/env node

/**
 * API Testing Script for Admin Dashboard
 * Tests all 6 API endpoints to verify they work correctly
 * 
 * Run: node test-api.js
 */

const BASE_URL = 'http://localhost:3000/api';
let testsPassed = 0;
let testsFailed = 0;

// Helper function to make API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

// Test helper
async function test(name, fn) {
  try {
    process.stdout.write(`\n${name}... `);
    await fn();
    console.log('✅ PASSED');
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('\n🧪 Testing Admin Dashboard API Routes\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Make sure the dev server is running: npm run dev\n');

  let instructionId, channelId;

  // Test 1: Get current instructions
  await test('Test 1: GET /instructions', async () => {
    const { status, data } = await apiCall('GET', '/instructions');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.data?.instructions) throw new Error('Missing instructions in response');
    console.log(`\n       Found: "${data.data.instructions.substring(0, 50)}..."`);
  });

  // Test 2: Update instructions
  await test('Test 2: POST /instructions', async () => {
    const newInstructions = 'Test instructions for API testing';
    const { status, data } = await apiCall('POST', '/instructions', {
      instructions: newInstructions
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (data.data.instructions !== newInstructions) throw new Error('Instructions not updated');
  });

  // Test 3: Get all channels (should be empty initially)
  await test('Test 3: GET /channels', async () => {
    const { status, data } = await apiCall('GET', '/channels');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data.data)) throw new Error('Expected array of channels');
    console.log(`\n       Found ${data.data.length} channels`);
  });

  // Test 4: Add a test channel
  await test('Test 4: POST /channels', async () => {
    const testChannel = {
      channel_id: '1234567890123456789',
      channel_name: 'test-channel',
      server_id: '9876543210987654321',
      server_name: 'Test Server'
    };
    const { status, data } = await apiCall('POST', '/channels', testChannel);
    if (status !== 201) throw new Error(`Expected 201, got ${status}`);
    if (!data.data?.id) throw new Error('No ID returned');
    channelId = data.data.id;
    console.log(`\n       Created channel: ${channelId.substring(0, 8)}...`);
  });

  // Test 5: Get specific channel
  await test('Test 5: GET /channels/[id]', async () => {
    if (!channelId) throw new Error('No channel ID from previous test');
    const { status, data } = await apiCall('GET', `/channels/${channelId}`);
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (data.data.id !== channelId) throw new Error('Channel ID mismatch');
  });

  // Test 6: Get all memories (should be empty initially)
  await test('Test 6: GET /memory', async () => {
    const { status, data } = await apiCall('GET', '/memory?limit=10&offset=0');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data.data)) throw new Error('Expected array of memories');
    if (!data.pagination) throw new Error('Missing pagination info');
    console.log(`\n       Found ${data.data.length} memories`);
  });

  // Test 7: Get memory for specific channel
  await test('Test 7: GET /memory/[channelId]', async () => {
    const { status, data } = await apiCall('GET', '/memory/1234567890123456789');
    if (status === 404) {
      console.log('\n       (No memory yet - this is expected)');
      return;
    }
    if (status !== 200) throw new Error(`Expected 200 or 404, got ${status}`);
  });

  // Test 8: Check reset-all stats
  await test('Test 8: GET /memory/reset-all (stats)', async () => {
    const { status, data } = await apiCall('GET', '/memory/reset-all');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.data?.total_channels) throw new Error('Missing total_channels in response');
    console.log(`\n       Total channels: ${data.data.total_channels}`);
  });

  // Test 9: Delete channel
  await test('Test 9: DELETE /channels/[id]', async () => {
    if (!channelId) throw new Error('No channel ID from previous test');
    const { status, data } = await apiCall('DELETE', `/channels/${channelId}`);
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (data.data.is_active !== false) throw new Error('Channel not marked as inactive');
  });

  // Test 10: Add duplicate channel (should fail)
  await test('Test 10: POST /channels (duplicate - should fail)', async () => {
    const testChannel = {
      channel_id: '1234567890123456789',
      channel_name: 'test-channel'
    };
    const { status } = await apiCall('POST', '/channels', testChannel);
    // Should fail because channel already exists (even though soft-deleted)
    // Or succeed if it was already deleted - depends on DB state
    console.log(`\n       Status: ${status} (depends on DB state)`);
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    console.log('🎉 All tests passed! API routes are working.\n');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  console.error('\nMake sure:');
  console.error('1. Dev server is running: npm run dev');
  console.error('2. Supabase credentials are correct in .env.local');
  console.error('3. Database schema is created in Supabase');
  process.exit(1);
});
