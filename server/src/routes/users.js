const express = require('express')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  getMe, getProfile, updateProfile, uploadAvatar,
  followUser, unfollowUser, getFollowers, getFollowing, getSuggestions,
} = require('../controllers/userController')

const router = express.Router()

router.get('/me', protect, getMe)
router.put('/me', protect, updateProfile)
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar)
router.get('/suggestions', protect, getSuggestions)
router.get('/:id/followers', getFollowers)
router.get('/:id/following', getFollowing)
router.post('/:id/follow', protect, followUser)
router.delete('/:id/follow', protect, unfollowUser)
router.get('/:username', getProfile)

module.exports = router
