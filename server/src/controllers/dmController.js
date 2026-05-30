const DMThread = require('../models/DMThread')
const Message = require('../models/Message')
const User = require('../models/User')
let _io = null
const setIo = (io) => { _io = io }

/** POST /api/dm/threads/:userId */
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body
    const recipientId = req.params.userId

    if (!content || !content.trim()) return res.status(400).json({ message: 'Message content must not be empty.' })
    if (content.length > 500) return res.status(400).json({ message: 'Message content must not exceed 500 characters.' })

    // Mutual follow check
    const me = await User.findById(req.user._id).select('following followers')
    const iFollowThem = me.following.map(String).includes(recipientId)
    const theyFollowMe = me.followers.map(String).includes(recipientId)
    if (!iFollowThem || !theyFollowMe)
      return res.status(403).json({ message: 'You can only message Users who follow you back.' })

    // Find or create thread
    const sortedIds = [req.user._id.toString(), recipientId].sort()
    let thread = await DMThread.findOne({ participants: { $all: sortedIds, $size: 2 } })
    if (!thread) thread = await DMThread.create({ participants: sortedIds })

    const message = await Message.create({
      thread: thread._id,
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id],
    })

    thread.lastMessage = message._id
    thread.updatedAt = new Date()
    await thread.save()

    if (_io) {
      _io.to(`user:${recipientId}`).emit('dm:new', { threadId: thread._id, message })
    }

    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/dm/threads */
const getThreads = async (req, res) => {
  try {
    const threads = await DMThread.find({ participants: req.user._id })
      .populate('participants', 'name username avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })

    const withUnread = await Promise.all(threads.map(async (t) => {
      const unread = await Message.countDocuments({ thread: t._id, readBy: { $ne: req.user._id } })
      return { ...t.toObject(), unreadCount: unread }
    }))

    res.json(withUnread)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/dm/threads/:threadId */
const getMessages = async (req, res) => {
  try {
    const thread = await DMThread.findOne({ _id: req.params.threadId, participants: req.user._id })
    if (!thread) return res.status(404).json({ message: 'Thread not found.' })

    const messages = await Message.find({ thread: thread._id })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: 1 })

    // Mark all as read
    await Message.updateMany(
      { thread: thread._id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    )

    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { sendMessage, getThreads, getMessages, setIo }
