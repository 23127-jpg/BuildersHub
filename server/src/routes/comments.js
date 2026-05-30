const express = require('express')
const { protect } = require('../middleware/auth')
const { createComment, getComments, likeComment, deleteComment } = require('../controllers/commentController')

const router = express.Router()

router.get('/:targetType/:targetId', getComments)
router.post('/', protect, createComment)
router.post('/:id/like', protect, likeComment)
router.delete('/:id', protect, deleteComment)

module.exports = router
