const express = require('express')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')
const { createPost, deletePost, toggleLike, repost, getFeed, getTrending, reactToPost, votePoll } = require('../controllers/postController')

const router = express.Router()

router.get('/feed', protect, getFeed)
router.get('/trending', getTrending)
router.post('/', protect, upload.single('image'), createPost)
router.delete('/:id', protect, deletePost)
router.post('/:id/like', protect, toggleLike)
router.post('/:id/repost', protect, repost)
router.post('/:id/react', protect, reactToPost)
router.post('/:id/vote', protect, votePoll)

module.exports = router
