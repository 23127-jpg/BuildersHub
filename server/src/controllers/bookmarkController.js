const Bookmark = require('../models/Bookmark')

/** POST /api/bookmarks — toggle */
const toggleBookmark = async (req, res) => {
  try {
    const { targetType, targetId } = req.body
    if (!['post', 'project'].includes(targetType)) return res.status(400).json({ message: 'Invalid targetType.' })

    const existing = await Bookmark.findOne({ user: req.user._id, targetType, targetId })
    if (existing) {
      await existing.deleteOne()
      return res.json({ bookmarked: false })
    }

    await Bookmark.create({ user: req.user._id, targetType, targetId })
    res.status(201).json({ bookmarked: true })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/bookmarks */
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .sort({ bookmarkedAt: -1 })
      .populate({ path: 'targetId', refPath: 'targetType' })
    res.json(bookmarks)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { toggleBookmark, getBookmarks }
