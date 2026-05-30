const express = require('express')
const { protect } = require('../middleware/auth')
const { sendMessage, getThreads, getMessages } = require('../controllers/dmController')

const router = express.Router()

router.get('/threads', protect, getThreads)
router.get('/threads/:threadId', protect, getMessages)
router.post('/threads/:userId', protect, sendMessage)

module.exports = router
