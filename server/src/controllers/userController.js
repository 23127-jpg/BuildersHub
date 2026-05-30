const User = require('../models/User')
const Post = require('../models/Post')
const Project = require('../models/Project')
const { uploadBuffer } = require('../utils/cloudinary')
const notificationService = require('../services/notificationService')

const SAFE_USER_FIELDS = '-password -refreshToken -googleId'

/** GET /api/users/me — return own profile */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(SAFE_USER_FIELDS)
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/users/:username */
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select(SAFE_USER_FIELDS)
    if (!user) return res.status(404).json({ message: 'User not found.' })

    const [projects, posts] = await Promise.all([
      Project.find({ maker: user._id, status: 'active' })
        .sort({ launchDate: -1 })
        .limit(6)
        .select('title tagline logo upvotes launchDate tags'),
      Post.find({ author: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('content type createdAt likes'),
    ])

    // Activity data: post counts per day for past 364 days
    const since = new Date(Date.now() - 364 * 24 * 60 * 60 * 1000)
    const activityRaw = await Post.aggregate([
      { $match: { author: user._id, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ])
    const activityData = activityRaw.map((d) => ({ date: d._id, count: d.count }))

    res.json({
      ...user.toObject(),
      followerCount: user.followers.length,
      followingCount: user.following.length,
      projects,
      recentPosts: posts,
      activityData,
    })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** PUT /api/users/me */
const updateProfile = async (req, res) => {
  try {
    const { bio, skills, githubUrl, portfolioUrl, themePreference } = req.body

    // Validate
    if (bio && bio.length > 300) {
      return res.status(400).json({ message: 'Bio must not exceed 300 characters.' })
    }
    const urlRegex = /^https?:\/\/.+/
    if (githubUrl && !urlRegex.test(githubUrl)) {
      return res.status(400).json({ message: 'githubUrl must be a valid URL.' })
    }
    if (portfolioUrl && !urlRegex.test(portfolioUrl)) {
      return res.status(400).json({ message: 'portfolioUrl must be a valid URL.' })
    }

    const updates = {}
    if (bio !== undefined) updates.bio = bio
    if (skills !== undefined) updates.skills = skills
    if (githubUrl !== undefined) updates.githubUrl = githubUrl
    if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl
    if (themePreference && ['dark', 'light'].includes(themePreference)) {
      updates.themePreference = themePreference
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select(SAFE_USER_FIELDS)
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/users/me/avatar */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' })
    const result = await uploadBuffer(req.file.buffer, 'buildershub/avatars')
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select(SAFE_USER_FIELDS)
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/users/:id/follow */
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Users cannot follow themselves.' })
    }
    const target = await User.findById(targetId)
    if (!target) return res.status(404).json({ message: 'User not found.' })

    if (req.user.following.map(String).includes(targetId)) {
      return res.status(409).json({ message: 'Already following this user.' })
    }

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId } })
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } })

    await notificationService.create({
      type: 'follow',
      recipient: targetId,
      sender: req.user._id,
    })

    const updated = await User.findById(req.user._id).select('following followers')
    res.json({ followerCount: updated.followers.length, followingCount: updated.following.length })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** DELETE /api/users/:id/follow */
const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } })
    await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } })
    const updated = await User.findById(req.user._id).select('following followers')
    res.json({ followerCount: updated.followers.length, followingCount: updated.following.length })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/users/:id/followers */
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name username avatar bio')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user.followers)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/users/:id/following */
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name username avatar bio')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user.following)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/users/suggestions */
const getSuggestions = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('skills following')
    const excludeIds = [...me.following.map(String), req.user._id.toString()]

    let suggestions = []

    if (me.skills.length > 0) {
      suggestions = await User.find({
        _id: { $nin: excludeIds },
        skills: { $in: me.skills },
      })
        .select('name username avatar bio skills')
        .limit(5)
    }

    if (suggestions.length < 5) {
      const more = await User.find({ _id: { $nin: [...excludeIds, ...suggestions.map((u) => u._id.toString())] } })
        .sort({ createdAt: -1 })
        .select('name username avatar bio skills')
        .limit(5 - suggestions.length)
      suggestions = [...suggestions, ...more]
    }

    res.json(suggestions)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getMe, getProfile, updateProfile, uploadAvatar, followUser, unfollowUser, getFollowers, getFollowing, getSuggestions }
