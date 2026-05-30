const express = require('express')
const { protect } = require('../middleware/auth')
const { generateDescription, suggestTags } = require('../controllers/aiController')

const router = express.Router()

router.post('/generate-description', protect, generateDescription)
router.post('/suggest-tags', protect, suggestTags)

module.exports = router
