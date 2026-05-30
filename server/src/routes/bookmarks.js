const express = require('express')
const { protect } = require('../middleware/auth')
const { toggleBookmark, getBookmarks } = require('../controllers/bookmarkController')

const router = express.Router()

router.post('/', protect, toggleBookmark)
router.get('/', protect, getBookmarks)

module.exports = router
