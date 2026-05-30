const mongoose = require('mongoose')
const { Schema } = mongoose

const bookmarkSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'project'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    bookmarkedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Compound unique index — one bookmark per user per item
bookmarkSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true })

const Bookmark = mongoose.model('Bookmark', bookmarkSchema)

module.exports = Bookmark
