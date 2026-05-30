const Post = require('../models/Post')
const User = require('../models/User')
const { uploadBuffer } = require('../utils/cloudinary')
const notificationService = require('../services/notificationService')

const VALID_TYPES = ['update', 'question', 'resource', 'poll']
const VALID_REACTIONS = ['fire', 'rocket', 'idea', 'clap']

/** POST /api/posts */
const createPost = async (req, res) => {
  try {
    const { content, type, pollOptions } = req.body

    if (!content || !content.trim()) return res.status(400).json({ message: 'Post content must not be empty.' })
    if (content.length > 280) return res.status(400).json({ message: 'Post content must not exceed 280 characters.' })
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ message: `type must be one of: ${VALID_TYPES.join(', ')}` })

    const postData = { content: content.trim(), type, author: req.user._id }

    // Image upload
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'buildershub/posts')
      postData.images = [result.secure_url]
    }

    // Poll
    if (type === 'poll') {
      const options = typeof pollOptions === 'string' ? JSON.parse(pollOptions) : pollOptions || []
      if (options.length < 2 || options.length > 4) return res.status(400).json({ message: 'A poll must have between 2 and 4 options.' })
      const invalid = options.find((o) => o.length > 100)
      if (invalid) return res.status(400).json({ message: 'Each poll option must not exceed 100 characters.' })
      postData.pollOptions = options.map((text) => ({ text, votes: [] }))
      postData.closesAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    }

    const post = await Post.create(postData)

    // Update streak
    await updateStreak(req.user._id)

    res.status(201).json(post)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** Streak update helper */
const updateStreak = async (userId) => {
  const user = await User.findById(userId).select('currentStreak longestStreak lastPostDate')
  const today = new Date(); today.setUTCHours(0, 0, 0, 0)

  if (!user.lastPostDate) {
    user.currentStreak = 1
  } else {
    const last = new Date(user.lastPostDate); last.setUTCHours(0, 0, 0, 0)
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) user.currentStreak += 1
    else if (diffDays > 1) user.currentStreak = 1
    // diffDays === 0 means same day, no change
  }

  if (user.currentStreak > user.longestStreak) user.longestStreak = user.currentStreak
  user.lastPostDate = today
  await user.save()

  // Milestone notifications
  const milestones = [7, 30, 100]
  if (milestones.includes(user.currentStreak)) {
    await notificationService.create({
      type: 'streak_milestone',
      recipient: userId,
      sender: userId,
      metadata: { milestoneValue: user.currentStreak },
    })
  }
}

/** DELETE /api/posts/:id */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found.' })
    if (!post.author.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' })
    await post.deleteOne()
    res.json({ message: 'Post deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/posts/:id/like */
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found.' })

    const userId = req.user._id
    const liked = post.likes.some((id) => id.equals(userId))

    if (liked) {
      post.likes.pull(userId)
    } else {
      post.likes.push(userId)
      await notificationService.create({ type: 'like', recipient: post.author, sender: userId, targetType: 'post', targetId: post._id })
    }

    await post.save()
    res.json({ likeCount: post.likes.length, liked: !liked })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/posts/:id/repost */
const repost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found.' })

    const userId = req.user._id
    if (post.reposts.some((id) => id.equals(userId))) {
      return res.status(409).json({ message: 'Post already reposted.' })
    }

    post.reposts.push(userId)
    await post.save()
    res.json({ repostCount: post.reposts.length })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/posts/feed */
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const skip = (page - 1) * pageSize

    const me = await User.findById(req.user._id).select('following')
    const posts = await Post.find({ author: { $in: me.following } })
      .populate('author', 'name username avatar currentStreak')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)

    res.json({ posts, page, nextPage: posts.length === pageSize ? page + 1 : null })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/posts/trending */
const getTrending = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const posts = await Post.find({ createdAt: { $gte: since } })
      .populate('author', 'name username avatar')
      .lean()

    posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    res.json(posts.slice(0, 50))
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/posts/:id/react */
const reactToPost = async (req, res) => {
  try {
    const { reactionType } = req.body
    if (!VALID_REACTIONS.includes(reactionType)) {
      return res.status(400).json({ message: 'Invalid reaction type.' })
    }

    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found.' })

    const userId = req.user._id

    // Remove user from all reaction arrays first
    for (const r of VALID_REACTIONS) {
      post.reactions[r].pull(userId)
    }

    // Check if toggling off (same type already applied — already removed above)
    const wasApplied = post.reactions[reactionType] // already pulled, check original
    // Re-add if not toggling off
    const originalPost = await Post.findById(req.params.id)
    const hadReaction = originalPost.reactions[reactionType].some((id) => id.equals(userId))

    if (!hadReaction) {
      post.reactions[reactionType].push(userId)
      await notificationService.create({
        type: 'reaction',
        recipient: post.author,
        sender: userId,
        targetType: 'post',
        targetId: post._id,
        metadata: { reactionType },
      })
    }

    await post.save()

    const counts = {}
    for (const r of VALID_REACTIONS) counts[r] = post.reactions[r].length
    res.json({ reactions: counts })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/posts/:id/vote */
const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found.' })
    if (post.type !== 'poll') return res.status(400).json({ message: 'Not a poll.' })
    if (new Date() > post.closesAt) return res.status(400).json({ message: 'This poll has closed.' })

    const userId = req.user._id
    const alreadyVoted = post.pollOptions.some((opt) => opt.votes.some((id) => id.equals(userId)))
    if (alreadyVoted) return res.status(409).json({ message: 'You have already voted on this poll.' })

    if (optionIndex < 0 || optionIndex >= post.pollOptions.length) {
      return res.status(400).json({ message: 'Invalid option index.' })
    }

    post.pollOptions[optionIndex].votes.push(userId)
    await post.save()

    const totalVotes = post.pollOptions.reduce((sum, o) => sum + o.votes.length, 0)
    const results = post.pollOptions.map((o) => ({
      text: o.text,
      votes: o.votes.length,
      percentage: totalVotes ? Math.round((o.votes.length / totalVotes) * 100) : 0,
    }))

    res.json({ results })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { createPost, deletePost, toggleLike, repost, getFeed, getTrending, reactToPost, votePoll }
