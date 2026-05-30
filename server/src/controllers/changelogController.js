const Changelog = require('../models/Changelog')
const Project = require('../models/Project')
const User = require('../models/User')
const notificationService = require('../services/notificationService')

/** GET /api/projects/:id/changelogs */
const getChangelogs = async (req, res) => {
  try {
    const changelogs = await Changelog.find({ project: req.params.id })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 })
    res.json(changelogs)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/projects/:id/changelogs */
const createChangelog = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    if (!project.maker.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' })

    const { version, title, body } = req.body
    const missing = []
    if (!version) missing.push('version')
    if (!title) missing.push('title')
    if (!body) missing.push('body')
    if (missing.length) return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` })

    if (version.length > 20) return res.status(400).json({ message: 'version must not exceed 20 characters.' })
    if (title.length > 100) return res.status(400).json({ message: 'title must not exceed 100 characters.' })
    if (body.length > 2000) return res.status(400).json({ message: 'body must not exceed 2000 characters.' })

    const changelog = await Changelog.create({ project: project._id, author: req.user._id, version, title, body })

    // Notify all followers of the maker
    const maker = await User.findById(req.user._id).select('followers')
    for (const followerId of maker.followers) {
      await notificationService.create({
        type: 'changelog',
        recipient: followerId,
        sender: req.user._id,
        targetType: 'project',
        targetId: project._id,
        metadata: { version, projectTitle: project.title },
      })
    }

    res.status(201).json(changelog)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getChangelogs, createChangelog }
