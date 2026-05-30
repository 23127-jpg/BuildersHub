const Notification = require('../models/Notification')

let _io = null

/**
 * Initialise with the Socket.io instance.
 * Called once from index.js after Socket.io is set up.
 */
const init = (io) => { _io = io }

/**
 * Creates a notification and emits it in real-time to the recipient.
 *
 * @param {Object} payload
 * @param {string} payload.type
 * @param {ObjectId} payload.recipient
 * @param {ObjectId} payload.sender
 * @param {string} [payload.targetType]
 * @param {ObjectId} [payload.targetId]
 * @param {Object} [payload.metadata]
 */
const create = async ({ type, recipient, sender, targetType, targetId, metadata }) => {
  // Don't notify yourself
  if (recipient.toString() === sender.toString()) return

  const notification = await Notification.create({
    type,
    recipient,
    sender,
    targetType,
    targetId,
    metadata,
  })

  if (_io) {
    const populated = await notification.populate('sender', 'name avatar username')
    _io.to(`user:${recipient}`).emit('notification:new', populated)

    const unreadCount = await Notification.countDocuments({ recipient, isRead: false })
    _io.to(`user:${recipient}`).emit('notification:count', { count: unreadCount })
  }

  return notification
}

module.exports = { init, create }
