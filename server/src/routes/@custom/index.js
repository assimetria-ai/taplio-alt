const express = require('express')
const router = express.Router()

// @custom — Taplio Alt API routes (LinkedIn content creation & scheduling)
router.use(require('../../api/@custom/posts'))
router.use(require('../../api/@custom/templates'))
router.use(require('../../api/@custom/analytics'))
router.use(require('../../api/@custom/leads'))
router.use(require('../../api/@custom/linkedin-oauth'))
router.use(require('../../api/@custom/ai-generate'))
router.use(require('../../api/@custom/blog'))

module.exports = router
