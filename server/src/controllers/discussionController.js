const Discussion = require('../models/Discussion')

const VALID_FLAIRS = ['Feedback Needed', 'Show Off', 'Question', 'Resource']

/** POST /api/discussions */
const createDiscussion = async (req, res) => {
  try {
    const { title, body, flair } = req.body
    const missing = []
    if (!title) missing.push('title')
    if (!body) missing.push('body')
    if (!flair) missing.push('flair')
    if (missing.length) return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` })
    if (!VALID_FLAIRS.includes(flair)) return res.status(400).json({ message: `flair must be one of: ${VALID_FLAIRS.join(', ')}` })

    const discussion = await Discussion.create({ title, body, flair, author: req.user._id })
    res.status(201).json(discussion)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/discussions */
const getDiscussions = async (req, res) => {
  try {
    const { flair } = req.query
    const filter = flair ? { flair } : {}
    const discussions = await Discussion.find(filter)
      .populate('author', 'name username avatar')
      .sort({ voteScore: -1, createdAt: -1 })
    res.json(discussions)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/discussions/:id */
const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).populate('author', 'name username avatar')
    if (!discussion) return res.status(404).json({ message: 'Discussion not found.' })
    res.json(discussion)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/discussions/:id/vote */
const voteDiscussion = async (req, res) => {
  try {
    const { direction } = req.body // 'up' | 'down'
    if (!['up', 'down'].includes(direction)) return res.status(400).json({ message: 'direction must be "up" or "down".' })

    const discussion = await Discussion.findById(req.params.id)
    if (!discussion) return res.status(404).json({ message: 'Discussion not found.' })

    const userId = req.user._id
    const hasUpvoted = discussion.upvotes.some((id) => id.equals(userId))
    const hasDownvoted = discussion.downvotes.some((id) => id.equals(userId))

    if (direction === 'up') {
      if (hasUpvoted) {
        discussion.upvotes.pull(userId) // toggle off
      } else {
        discussion.upvotes.push(userId)
        if (hasDownvoted) discussion.downvotes.pull(userId) // switch direction
      }
    } else {
      if (hasDownvoted) {
        discussion.downvotes.pull(userId) // toggle off
      } else {
        discussion.downvotes.push(userId)
        if (hasUpvoted) discussion.upvotes.pull(userId) // switch direction
      }
    }

    discussion.voteScore = discussion.upvotes.length - discussion.downvotes.length
    await discussion.save()
    res.json({ voteScore: discussion.voteScore })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { createDiscussion, getDiscussions, getDiscussion, voteDiscussion }
