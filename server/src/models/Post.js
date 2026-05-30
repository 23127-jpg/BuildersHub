const mongoose = require('mongoose')
const { Schema } = mongoose

const pollOptionSchema = new Schema(
  {
    text: { type: String, required: true, maxlength: 100 },
    votes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: true }
)

const postSchema = new Schema(
  {
    content: { type: String, required: true, maxlength: 280 },
    images: [{ type: String }], // Cloudinary URLs
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reposts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    type: {
      type: String,
      enum: ['update', 'question', 'resource', 'poll'],
      required: true,
    },
    // Poll fields (only when type === 'poll')
    pollOptions: [pollOptionSchema],
    closesAt: { type: Date }, // set to +24h for polls
    // Emoji reactions
    reactions: {
      fire:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
      rocket: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      idea:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
      clap:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

// Text index for search
postSchema.index({ content: 'text' })

// Performance indexes
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ createdAt: -1 })

const Post = mongoose.model('Post', postSchema)

module.exports = Post
