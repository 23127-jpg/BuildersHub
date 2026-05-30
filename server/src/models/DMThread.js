const mongoose = require('mongoose')
const { Schema } = mongoose

const dmThreadSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }], // always 2 users
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

dmThreadSchema.index({ participants: 1 })

const DMThread = mongoose.model('DMThread', dmThreadSchema)

module.exports = DMThread
