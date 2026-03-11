// @system — server entry point
// Loads environment, validates config, starts the HTTP server.

'use strict'

require('dotenv').config()
require('./lib/@system/Env')         // validate and exit on misconfiguration

const app    = require('./app')
const logger = require('./lib/@system/Logger')

const port = Number(process.env.PORT ?? 4000)

const server = app.listen(port, () => {
  logger.info({ port }, 'server listening')
})

// ── Graceful shutdown ─────────────────────────────────────────────────────────

function shutdown(signal) {
  logger.info({ signal }, 'shutting down')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })

  // Force-kill after 10s if connections do not drain
  setTimeout(() => {
    logger.warn('forced shutdown after timeout')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
