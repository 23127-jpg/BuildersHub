const mongoose = require('mongoose')
const { Schema } = mongoose

const collectionSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 50, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

collectionSchema.index({ owner: 1 })

const Collection = mongoose.model('Collection', collectionSchema)

module.exports = Collection
