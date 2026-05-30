const mongoose = require('mongoose')
const { Schema } = mongoose

const messageSchema = new Schema(
  {
    thread: { type: Schema.Types.ObjectId, ref: 'DMThread', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500 },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

messageSchema.index({ thread: 1, createdAt: 1 })

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
