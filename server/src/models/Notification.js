const mongoose = require('mongoose')
const { Schema } = mongoose

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'upvote', 'repost', 'reaction', 'streak_milestone', 'changelog'],
      required: true,
    },
    targetType: { type: String },
    targetId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification
