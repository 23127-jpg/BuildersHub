const Notification = require('../models/Notification')

/** GET /api/notifications */
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 50
    const skip = (page - 1) * limit

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({ notifications, page, nextPage: notifications.length === limit ? page + 1 : null })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** PUT /api/notifications/read-all */
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })
    res.json({ message: 'All notifications marked as read.' })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** PUT /api/notifications/:id/read */
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ message: 'Notification not found.' })
    res.json(notification)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getNotifications, markAllRead, markRead }
