const mongoose = require('mongoose')
const { Schema } = mongoose

const discussionSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 200, trim: true },
    body: { type: String, required: true, maxlength: 10000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    flair: {
      type: String,
      enum: ['Feedback Needed', 'Show Off', 'Question', 'Resource'],
      required: true,
    },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    voteScore: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

discussionSchema.index({ voteScore: -1 })
discussionSchema.index({ flair: 1, voteScore: -1 })

const Discussion = mongoose.model('Discussion', discussionSchema)

module.exports = Discussion
