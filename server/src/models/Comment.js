const mongoose = require('mongoose')
const { Schema } = mongoose

const commentSchema = new Schema(
  {
    content: { type: String, required: true, maxlength: 1000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    targetType: { type: String, enum: ['project', 'post', 'discussion'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    depth: { type: Number, default: 0 }, // 0 = top-level, 1 = reply
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

commentSchema.index({ targetType: 1, targetId: 1, parentComment: 1 })

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
