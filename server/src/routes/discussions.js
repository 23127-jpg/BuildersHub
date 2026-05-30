const express = require('express')
const { protect } = require('../middleware/auth')
const { createDiscussion, getDiscussions, getDiscussion, voteDiscussion } = require('../controllers/discussionController')

const router = express.Router()

router.get('/', getDiscussions)
router.post('/', protect, createDiscussion)
router.get('/:id', getDiscussion)
router.post('/:id/vote', protect, voteDiscussion)

module.exports = router
