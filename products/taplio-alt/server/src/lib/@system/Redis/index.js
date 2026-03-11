// @system — ioredis client with graceful degradation
// Rate limiters and other consumers check isReady() before using the client.
// If Redis is unavailable the app continues with in-memory fallbacks.
//
// Usage:
//   const { client, isReady } = require('../lib/@system/Redis')
//   if (isReady()) { await client.get('key') }

const Redis = require('ioredis')
const logger = require('../Logger')

let client = null
let _ready = false

const url = process.env.REDIS_URL || 'redis://localhost:6379'

try {
  client = new Redis(url, {
    // Don't queue commands when disconnected — callers should check isReady() first.
    enableOfflineQueue: false,
    // Disable auto-retry so a missing Redis doesn't stall startup or flood logs.
    retryStrategy: () => null,
    lazyConnect: true,
  })

  client.on('ready', () => {
    _ready = true
    logger.info({ url }, 'Redis connected')
  })

  client.on('error', (err) => {
    // Only log once when transitioning from ready → error to avoid log spam.
    if (_ready) logger.warn({ err }, 'Redis error — rate limiting will use in-memory store')
    _ready = false
  })

  client.on('end', () => {
    _ready = false
  })

  // Initiate connection; swallow errors here — the 'error' handler logs them.
  client.connect().catch((err) => {
    logger.warn({ err }, 'Redis unavailable — rate limiting will use in-memory fallback')
  })
} catch (err) {
  logger.warn({ err }, 'Redis client init failed — rate limiting will use in-memory fallback')
  client = null
}

/** Returns true only when the client is fully connected and ready for commands. */
function isReady() {
  return _ready && client !== null
}

module.exports = { client, isReady }
