# Admin Dashboard API Routes Documentation

All API routes are located in `/admin-dashboard/src/app/api/`

---

## 📋 System Instructions API

### GET /api/instructions
Fetch the current active system instructions

**Request:**
```bash
curl http://localhost:3000/api/instructions
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "instructions": "You are a helpful Discord assistant...",
    "is_active": true,
    "created_at": "2026-01-08T10:00:00Z",
    "updated_at": "2026-01-08T10:00:00Z"
  }
}
```

---

### POST /api/instructions
Update system instructions

**Request:**
```bash
curl -X POST http://localhost:3000/api/instructions \
  -H "Content-Type: application/json" \
  -d '{
    "instructions": "You are a friendly Discord bot assistant. Always be helpful and concise."
  }'
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "instructions": "You are a friendly Discord bot assistant...",
    "is_active": true,
    "updated_at": "2026-01-08T10:30:00Z"
  },
  "message": "Instructions updated successfully"
}
```

**Error (400):**
```json
{
  "error": "Instructions cannot be empty"
}
```

---

## 📍 Allowed Channels API

### GET /api/channels
List all allowed channels

**Request:**
```bash
curl http://localhost:3000/api/channels
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "channel_id": "1234567890123456789",
      "channel_name": "general",
      "server_id": "9876543210987654321",
      "server_name": "My Discord Server",
      "is_active": true,
      "created_at": "2026-01-08T10:00:00Z"
    }
  ]
}
```

---

### POST /api/channels
Add a new allowed channel

**Request:**
```bash
curl -X POST http://localhost:3000/api/channels \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "1234567890123456789",
    "channel_name": "general",
    "server_id": "9876543210987654321",
    "server_name": "My Discord Server"
  }'
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "channel_id": "1234567890123456789",
    "channel_name": "general",
    "is_active": true,
    "created_at": "2026-01-08T10:15:00Z"
  },
  "message": "Channel added to allow-list successfully"
}
```

**Error (400):**
```json
{
  "error": "Invalid Discord channel ID format. Must be 18-20 digits."
}
```

**Error (409):**
```json
{
  "error": "Channel already in allow-list"
}
```

---

### DELETE /api/channels/[id]
Remove a channel from allow-list

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/channels/uuid-here
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "channel_id": "1234567890123456789",
    "is_active": false
  },
  "message": "Channel removed from allow-list"
}
```

**Error (404):**
```json
{
  "error": "Channel not found"
}
```

---

### GET /api/channels/[id]
Get details for a specific channel

**Request:**
```bash
curl http://localhost:3000/api/channels/uuid-here
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "channel_id": "1234567890123456789",
    "channel_name": "general",
    "is_active": true,
    "created_at": "2026-01-08T10:00:00Z"
  }
}
```

---

## 💬 Conversation Memory API

### GET /api/memory
List all conversation memories with pagination

**Request:**
```bash
curl "http://localhost:3000/api/memory?limit=10&offset=0"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "channel_id": "1234567890123456789",
      "summary": "User asked about project status and deadlines.",
      "message_count": 5,
      "recent_messages": [
        { "role": "user", "content": "What's the status?", "timestamp": "..." },
        { "role": "assistant", "content": "...", "timestamp": "..." }
      ],
      "last_message_at": "2026-01-08T11:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### GET /api/memory/[channelId]
Get memory for a specific channel

**Request:**
```bash
curl http://localhost:3000/api/memory/1234567890123456789
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "channel_id": "1234567890123456789",
    "summary": "User asked about project status.",
    "message_count": 5,
    "recent_messages": [...],
    "last_message_at": "2026-01-08T11:30:00Z"
  }
}
```

**Error (404):**
```json
{
  "error": "Memory not found for this channel"
}
```

---

### DELETE /api/memory/[channelId]
Reset conversation memory for a specific channel

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/memory/1234567890123456789
```

**Response (200 OK):**
```json
{
  "data": true,
  "message": "Conversation memory reset successfully"
}
```

---

### GET /api/memory/reset-all
Get statistics about memories before resetting

**Request:**
```bash
curl http://localhost:3000/api/memory/reset-all
```

**Response (200 OK):**
```json
{
  "data": {
    "total_channels": 5,
    "total_messages": 42,
    "message": "Statistics about memories to be reset. Use POST to actually reset."
  }
}
```

---

### POST /api/memory/reset-all
⚠️ **DANGEROUS**: Reset ALL conversation memories at once

**Request:**
```bash
curl -X POST http://localhost:3000/api/memory/reset-all
```

**Response (200 OK):**
```json
{
  "data": {
    "reset_count": 5,
    "message": "Reset 5 conversation memories"
  },
  "message": "All memories reset successfully"
}
```

---

## 🧪 Testing All APIs

Use the provided test script:

```bash
cd admin-dashboard
npm install   # If not already installed
node test-api.js
```

Or test manually with curl:

```bash
# Test 1: Get instructions
curl http://localhost:3000/api/instructions

# Test 2: Add a channel
curl -X POST http://localhost:3000/api/channels \
  -H "Content-Type: application/json" \
  -d '{"channel_id":"1234567890123456789","channel_name":"test"}'

# Test 3: Update instructions
curl -X POST http://localhost:3000/api/instructions \
  -H "Content-Type: application/json" \
  -d '{"instructions":"Hello, I am a test bot!"}'

# Test 4: List memories
curl http://localhost:3000/api/memory
```

---

## ✅ API Validation Rules

### Channel ID
- Must be 18-20 digits (Discord snowflake format)
- Must be unique (cannot add same channel twice)
- Example: `1234567890123456789`

### Instructions
- Cannot be empty
- Trimmed before saving
- Max length: unlimited (text field)

### Memory Reset
- Soft delete: channels remain but memory is cleared
- Idempotent: safe to call multiple times
- Reversible: data can be recovered from backups

---

## 🔐 Error Handling

All endpoints follow consistent error patterns:

```json
{
  "error": "Descriptive error message"
}
```

Common HTTP Status Codes:
- **200 OK**: Success
- **201 Created**: New resource created
- **400 Bad Request**: Invalid input
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server error

---

## 📝 Next Steps

1. ✅ API routes created
2. ⬜ Build frontend UI components
3. ⬜ Connect UI to these APIs
4. ⬜ Test end-to-end
5. ⬜ Deploy to Vercel
