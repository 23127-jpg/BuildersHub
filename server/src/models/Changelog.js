const mongoose = require('mongoose')
const { Schema } = mongoose

const changelogSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    version: { type: String, required: true, maxlength: 20, trim: true },
    title: { type: String, required: true, maxlength: 100, trim: true },
    body: { type: String, required: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

changelogSchema.index({ project: 1, createdAt: -1 })

const Changelog = mongoose.model('Changelog', changelogSchema)

module.exports = Changelog
