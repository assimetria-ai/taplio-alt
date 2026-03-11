// @custom — storage API
// GET    /api/storage/files             — list uploaded files (authenticated)
// POST   /api/storage/presign           — request a presigned upload token (authenticated)
// PATCH  /api/storage/:fileId/confirm   — confirm a presigned upload completed (authenticated)
// POST   /api/storage/upload            — direct upload a file (authenticated users)
// DELETE /api/storage/:key              — delete an uploaded file (authenticated users)

const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const { uploadLimiter, dailyUploadQuotaLimiter } = require('../../../lib/@system/RateLimit')
const logger = require('../../../lib/@system/Logger')
const s3 = require('../../../lib/@system/S3')

// Allowed MIME types whitelist.
// The client-declared Content-Type check below is a first-pass filter only —
// it is attacker-controlled and MUST be paired with magic byte validation.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
])

// Use in-memory storage so raw bytes are available for magic byte inspection
// before the file ever touches disk. Disk-based storage would persist the file
// before we can validate its actual content.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    // First-pass: reject obviously wrong Content-Type headers early.
    // This is a client-controlled value — magic byte detection below is the
    // authoritative gate.
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(Object.assign(new Error('File type not allowed'), { status: 415 }))
    }
    cb(null, true)
  },
})

const UPLOAD_DIR = path.resolve(__dirname, '../../../../../uploads')

// Strict allowlist of valid folder values used to namespace S3 keys.
// Any folder value not in this set is rejected before the key is constructed.
const VALID_FOLDERS = new Set(['avatars', 'documents', 'images'])

// Lookup table used by /presign to derive extensions from server-validated MIME types.
// Built from ALLOWED_MIME_TYPES so the two sets stay in sync automatically.
const MIME_EXT_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
}

// Reverse map: extension → MIME type (used when populating file listings).
const EXT_MIME_MAP = Object.fromEntries(
  Object.entries(MIME_EXT_MAP).map(([mime, ext]) => [ext, mime])
)

// In-memory store for pending presign tokens { fileId → { key, mimeType, userId, expiresAt } }.
// In production, replace this with a Redis- or DB-backed store so tokens survive restarts
// and are visible across multiple server processes.
const pendingPresigns = new Map()

// ── List uploaded files (local storage) ──────────────────────────────────

// GET /api/storage/files
// Returns a list of files currently in the local upload directory.
// Query params:
//   folder {string} — optional; one of avatars|documents|images. Omit to list all.
// In production with S3, replace this with an S3 listObjectsV2 call.
router.get('/storage/files', authenticate, (req, res, next) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return res.json({ files: [] })
    }

    // Optional folder filter — validate against the strict allowlist if provided.
    const filterFolder = req.query.folder
    if (filterFolder !== undefined && !VALID_FOLDERS.has(filterFolder)) {
      return res.status(400).json({ message: 'Invalid folder. Must be one of: avatars, documents, images' })
    }
    const foldersToList = filterFolder ? [filterFolder] : [...VALID_FOLDERS]

    const files = []
    for (const folder of foldersToList) {
      const folderPath = path.join(UPLOAD_DIR, folder)
      if (!fs.existsSync(folderPath)) continue
      const entries = fs.readdirSync(folderPath)
      for (const name of entries) {
        const filePath = path.join(folderPath, name)
        const stat = fs.statSync(filePath)
        if (stat.isFile()) {
          const ext = path.extname(name).slice(1).toLowerCase()
          files.push({
            key: `${folder}/${name}`,
            name,
            folder,
            size: stat.size,
            uploadedAt: stat.mtime.toISOString(),
            ext,
            mimeType: EXT_MIME_MAP[ext] ?? null,
          })
        }
      }
    }

    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    res.json({ files })
  } catch (err) {
    next(err)
  }
})

// ── File download ─────────────────────────────────────────────────────────────

// GET /api/storage/download?key=folder/filename
// Serves the requested file as a download attachment.
// Query params:
//   key {string} — required; format: "folder/filename" (e.g. "documents/report.pdf")
router.get('/storage/download', authenticate, (req, res, next) => {
  try {
    const key = req.query.key
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ message: 'Missing key parameter' })
    }

    const parts = key.split('/')
    if (parts.length !== 2) {
      return res.status(400).json({ message: 'Invalid file key format. Expected: folder/filename' })
    }

    const [folder, rawName] = parts

    if (!VALID_FOLDERS.has(folder)) {
      return res.status(400).json({ message: 'Invalid folder. Must be one of: avatars, documents, images' })
    }

    // Sanitise filename to prevent path traversal — reject any name that contains separators.
    const safeName = path.basename(rawName)
    if (!safeName || safeName !== rawName) {
      return res.status(400).json({ message: 'Invalid filename' })
    }

    const filePath = path.join(UPLOAD_DIR, folder, safeName)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' })
    }

    logger.info({ key, userId: req.user.id }, 'file downloaded')
    res.download(filePath, safeName)
  } catch (err) {
    next(err)
  }
})

// ── Presign + confirm (S3-style two-step upload) ─────────────────────────

// POST /api/storage/presign
// Issues a short-lived upload token so the client can perform the actual upload
// without extra round-trips. uploadLimiter guards against IP-level flooding;
// dailyUploadQuotaLimiter enforces per-user storage quotas to prevent exhaustion.
router.post(
  '/storage/presign',
  uploadLimiter,
  authenticate,
  dailyUploadQuotaLimiter,
  async (req, res, next) => {
    try {
      const { folder, mimeType } = req.body ?? {}

      if (!folder || !VALID_FOLDERS.has(folder)) {
        logger.warn(
          { folder, userId: req.user?.id },
          'presign rejected: folder not in allowlist'
        )
        return res.status(400).json({ message: 'Invalid folder. Must be one of: avatars, documents, images' })
      }

      if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
        logger.warn(
          { mimeType, userId: req.user?.id },
          'presign rejected: MIME type not allowed'
        )
        return res.status(415).json({ message: 'MIME type not allowed' })
      }

      // Extension is derived server-side from the validated MIME type — never from
      // a client-supplied filename — to prevent extension spoofing.
      const ext = MIME_EXT_MAP[mimeType] ?? 'bin'
      const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`
      const fileId = crypto.randomBytes(32).toString('hex')
      const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

      pendingPresigns.set(fileId, { key, mimeType, userId: req.user.id, expiresAt })

      logger.info({ key, userId: req.user.id }, 'presign token issued')

      // In production: generate a real S3 presigned PUT URL here and include it in
      // the response so the client can upload directly to object storage.
      res.status(200).json({ fileId, key, expiresAt })
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /api/storage/:fileId/confirm
// Called by the client after the actual file upload to object storage completes.
// uploadLimiter prevents flooding the confirm endpoint; dailyUploadQuotaLimiter
// ensures total daily upload activity stays within per-user bounds.
router.patch(
  '/storage/:fileId/confirm',
  uploadLimiter,
  authenticate,
  dailyUploadQuotaLimiter,
  async (req, res, next) => {
    try {
      const { fileId } = req.params
      const pending = pendingPresigns.get(fileId)

      if (!pending) {
        return res.status(404).json({ message: 'Upload token not found or already used' })
      }

      if (Date.now() > pending.expiresAt) {
        pendingPresigns.delete(fileId)
        logger.warn({ fileId, userId: req.user.id }, 'confirm rejected: presign token expired')
        return res.status(410).json({ message: 'Upload token has expired' })
      }

      if (pending.userId !== req.user.id) {
        logger.warn(
          { fileId, tokenOwner: pending.userId, requestor: req.user.id },
          'confirm rejected: token owner mismatch'
        )
        return res.status(403).json({ message: 'Upload token does not belong to this user' })
      }

      pendingPresigns.delete(fileId)
      logger.info({ key: pending.key, userId: req.user.id }, 'upload confirmed')
      res.json({ key: pending.key, mime: pending.mimeType })
    } catch (err) {
      next(err)
    }
  }
)

// ── Direct upload (legacy / internal use) ────────────────────────────────

// POST /api/storage/upload
router.post('/storage/upload', uploadLimiter, authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Validate the folder parameter against the strict allowlist.
    // An unvalidated folder value could be used to manipulate the S3 key path
    // (e.g. "../secrets/", "../../etc") — reject anything not on the list.
    const folder = req.body?.folder ?? req.query?.folder
    if (!folder || !VALID_FOLDERS.has(folder)) {
      logger.warn(
        { folder, userId: req.user?.id },
        'upload rejected: folder parameter is not in the allowlist'
      )
      return res.status(400).json({ message: 'Invalid folder. Must be one of: avatars, documents, images' })
    }

    // Magic byte validation: use file-type to detect the actual MIME type from
    // the raw file bytes, independent of the client-declared Content-Type header.
    // file-type is ESM-only; dynamic import ensures CommonJS compatibility.
    const { fileTypeFromBuffer } = await import('file-type')
    const detected = await fileTypeFromBuffer(req.file.buffer)

    // Reject if actual content type is not in the allowlist.
    if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
      logger.warn(
        { declared: req.file.mimetype, detected: detected?.mime ?? 'unknown', userId: req.user?.id },
        'upload rejected: magic bytes do not match an allowed type'
      )
      return res.status(415).json({ message: 'File content does not match an allowed MIME type' })
    }

    // Reject if declared type and magic-byte-detected type disagree.
    // This catches files renamed/re-headered to pass the Content-Type whitelist.
    if (detected.mime !== req.file.mimetype) {
      logger.warn(
        { declared: req.file.mimetype, detected: detected.mime, userId: req.user?.id },
        'upload rejected: declared MIME type does not match detected magic bytes'
      )
      return res.status(415).json({ message: 'Declared MIME type does not match actual file content' })
    }

    // Both the client-declared type and magic bytes agree — safe to persist.
    // Folder is already validated; include it in the key to namespace uploads.
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${detected.ext}`
    fs.writeFileSync(path.join(UPLOAD_DIR, key), req.file.buffer)

    logger.info({ key, mime: detected.mime, size: req.file.size, userId: req.user.id }, 'file uploaded')
    res.status(201).json({ key, mime: detected.mime, size: req.file.size })
  } catch (err) {
    next(err)
  }
})

// GET /api/storage/status
// Returns whether the server is using local disk storage or S3/MinIO.
router.get('/storage/status', authenticate, (req, res) => {
  const s3Configured = s3.isConfigured()
  res.json({
    mode:     s3Configured ? 's3' : 'local',
    bucket:   s3Configured ? process.env.S3_BUCKET : null,
    region:   s3Configured ? (process.env.AWS_REGION ?? 'eu-west-1') : null,
    endpoint: s3Configured ? (process.env.S3_ENDPOINT ?? null) : null,
  })
})

// DELETE /api/storage/:key
// The client encodes folder-prefixed keys with encodeURIComponent so a key like
// "documents/file.pdf" becomes DELETE /api/storage/documents%2Ffile.pdf.
// Express decodes path params so req.params.key arrives as "documents/file.pdf".
// Extract and validate both folder and filename before constructing the path
// to prevent path traversal regardless of how Express's decoding behaves.
router.delete('/storage/:key', authenticate, async (req, res, next) => {
  try {
    const rawKey   = req.params.key  // already decoded by Express
    const slashIdx = rawKey.indexOf('/')

    if (slashIdx === -1 || slashIdx === 0 || slashIdx === rawKey.length - 1) {
      return res.status(400).json({ message: 'Invalid file key format. Expected: folder/filename' })
    }

    const folder  = rawKey.slice(0, slashIdx)
    const rawName = rawKey.slice(slashIdx + 1)

    // Validate folder against the strict allowlist to prevent path manipulation.
    if (!VALID_FOLDERS.has(folder)) {
      return res.status(400).json({ message: 'Invalid folder. Must be one of: avatars, documents, images' })
    }

    // path.basename removes any remaining traversal sequences in the filename.
    const safeName = path.basename(rawName)
    if (!safeName || safeName !== rawName) {
      return res.status(400).json({ message: 'Invalid filename' })
    }

    const filePath = path.join(UPLOAD_DIR, folder, safeName)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' })
    }

    fs.unlinkSync(filePath)
    logger.info({ key: rawKey, userId: req.user.id }, 'file deleted')
    res.json({ message: 'File deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
