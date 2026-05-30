const mongoose = require('mongoose')
const { Schema } = mongoose

const VALID_TAGS = ['AI', 'Web3', 'SaaS', 'Open Source', 'Dev Tools', 'Mobile', 'Game', 'Other']

const projectSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 100, trim: true },
    tagline: { type: String, required: true, maxlength: 150, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    logo: { type: String, required: true }, // Cloudinary URL
    screenshots: [{ type: String }],        // max 5 Cloudinary URLs
    liveUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    tags: [{ type: String, enum: VALID_TAGS }],
    maker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    launchDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: false }
)

// Text index for search
projectSchema.index({ title: 'text', tagline: 'text', description: 'text' })

// Performance indexes
projectSchema.index({ launchDate: -1, upvotes: 1 })
projectSchema.index({ maker: 1 })

const Project = mongoose.model('Project', projectSchema)

module.exports = Project
module.exports.VALID_TAGS = VALID_TAGS
