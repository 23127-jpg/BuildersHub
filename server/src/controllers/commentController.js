const Comment = require('../models/Comment')
const Project = require('../models/Project')
const Post = require('../models/Post')
const Discussion = require('../models/Discussion')
const notificationService = require('../services/notificationService')

/** POST /api/comments */
const createComment = async (req, res) => {
  try {
    const { content, targetType, targetId, parentComment } = req.body

    if (!content || !content.trim()) return res.status(400).json({ message: 'Comment content must not be empty.' })
    if (content.length > 1000) return res.status(400).json({ message: 'Comment must not exceed 1000 characters.' })
    if (!['project', 'post', 'discussion'].includes(targetType)) return res.status(400).json({ message: 'Invalid targetType.' })

    let depth = 0
    let resolvedParent = null

    if (parentComment) {
      const parent = await Comment.findById(parentComment)
      if (!parent) return res.status(404).json({ message: 'Parent comment not found.' })

      if (parent.depth >= 1) {
        // Cap at depth 1 — set parent to the top-level comment
        resolvedParent = parent.parentComment
        depth = 1
      } else {
        resolvedParent = parent._id
        depth = 1
      }
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      targetType,
      targetId,
      parentComment: resolvedParent,
      depth,
    })

    // Update commentsCount on target
    if (targetType === 'project') {
      await Project.findByIdAndUpdate(targetId, { $inc: { commentsCount: 1 } })
      const project = await Project.findById(targetId).select('maker')
      if (project) {
        await notificationService.create({ type: 'comment', recipient: project.maker, sender: req.user._id, targetType, targetId })
      }
    } else if (targetType === 'post') {
      const post = await Post.findById(targetId).select('author')
      if (post) {
        await notificationService.create({ type: 'comment', recipient: post.author, sender: req.user._id, targetType, targetId })
      }
    } else if (targetType === 'discussion') {
      await Discussion.findByIdAndUpdate(targetId, { $inc: { commentsCount: 1 } })
    }

    const populated = await comment.populate('author', 'name username avatar')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/comments/:targetType/:targetId */
const getComments = async (req, res) => {
  try {
    const { targetType, targetId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const topLevel = await Comment.find({ targetType, targetId, parentComment: null })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const withReplies = await Promise.all(
      topLevel.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'name username avatar')
          .sort({ createdAt: 1 })
        return { ...comment.toObject(), replies }
      })
    )

    res.json({ comments: withReplies, page, nextPage: topLevel.length === limit ? page + 1 : null })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/comments/:id/like */
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Comment not found.' })

    const userId = req.user._id
    const liked = comment.likes.some((id) => id.equals(userId))
    if (liked) comment.likes.pull(userId)
    else comment.likes.push(userId)

    await comment.save()
    res.json({ likeCount: comment.likes.length, liked: !liked })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** DELETE /api/comments/:id */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Comment not found.' })
    if (!comment.author.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' })
    await comment.deleteOne()
    res.json({ message: 'Comment deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { createComment, getComments, likeComment, deleteComment }
