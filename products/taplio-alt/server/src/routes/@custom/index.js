const express = require('express')
const router = express.Router()
router.use(require('../../api/@custom/storage'))
router.use(require('../../api/@custom/blog'))
router.use(require('../../api/@custom/items'))
module.exports = router
