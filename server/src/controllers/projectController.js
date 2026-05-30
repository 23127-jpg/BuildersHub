const Project = require('../models/Project')
const { VALID_TAGS } = require('../models/Project')
const { uploadBuffer } = require('../utils/cloudinary')
const notificationService = require('../services/notificationService')

/** POST /api/projects */
const createProject = async (req, res) => {
  try {
    const { title, tagline, description, liveUrl, githubUrl, tags } = req.body
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags || []

    // Validate required fields
    const missing = []
    if (!title) missing.push('title')
    if (!tagline) missing.push('tagline')
    if (!description) missing.push('description')
    if (!parsedTags.length) missing.push('tags')
    if (missing.length) return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` })

    // Validate tags
    const invalidTags = parsedTags.filter((t) => !VALID_TAGS.includes(t))
    if (invalidTags.length) return res.status(400).json({ message: 'Invalid tag value.' })

    // Logo required
    const logoFile = req.files?.logo?.[0]
    if (!logoFile) return res.status(400).json({ message: 'Project logo is required.' })

    // Upload logo
    const logoResult = await uploadBuffer(logoFile.buffer, 'buildershub/logos')

    // Upload screenshots (max 5)
    const screenshotFiles = req.files?.screenshots || []
    if (screenshotFiles.length > 5) return res.status(400).json({ message: 'Maximum 5 screenshots allowed.' })
    const screenshotUrls = await Promise.all(
      screenshotFiles.map((f) => uploadBuffer(f.buffer, 'buildershub/screenshots').then((r) => r.secure_url))
    )

    const project = await Project.create({
      title, tagline, description,
      logo: logoResult.secure_url,
      screenshots: screenshotUrls,
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      tags: parsedTags,
      maker: req.user._id,
    })

    res.status(201).json(project)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/projects */
const getProjects = async (req, res) => {
  try {
    const { date = 'today', tag, sort } = req.query
    const filter = { status: 'active' }

    const now = new Date()
    if (date === 'today') {
      const start = new Date(now); start.setUTCHours(0, 0, 0, 0)
      filter.launchDate = { $gte: start }
    } else if (date === 'this week') {
      const start = new Date(now)
      start.setUTCDate(now.getUTCDate() - now.getUTCDay())
      start.setUTCHours(0, 0, 0, 0)
      filter.launchDate = { $gte: start }
    }

    if (tag) filter.tags = tag

    const projects = await Project.find(filter)
      .populate('maker', 'name username avatar')
      .sort({ 'upvotes.length': -1, launchDate: -1 })
      .lean()

    // Sort by upvote count (lean doesn't support virtual)
    projects.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))

    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/projects/:id */
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('maker', 'name username avatar bio')
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** PUT /api/projects/:id */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    if (!project.maker.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' })

    const { title, tagline, description, liveUrl, githubUrl, tags, status } = req.body
    if (title) project.title = title
    if (tagline) project.tagline = tagline
    if (description) project.description = description
    if (liveUrl !== undefined) project.liveUrl = liveUrl
    if (githubUrl !== undefined) project.githubUrl = githubUrl
    if (tags) {
      const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags
      const invalid = parsedTags.filter((t) => !VALID_TAGS.includes(t))
      if (invalid.length) return res.status(400).json({ message: 'Invalid tag value.' })
      project.tags = parsedTags
    }
    if (status && ['active', 'archived'].includes(status)) project.status = status

    await project.save()
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** DELETE /api/projects/:id */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    if (!project.maker.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' })
    await project.deleteOne()
    res.json({ message: 'Project deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/projects/:id/upvote */
const toggleUpvote = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })

    const userId = req.user._id
    const hasUpvoted = project.upvotes.some((id) => id.equals(userId))

    if (hasUpvoted) {
      project.upvotes.pull(userId)
    } else {
      project.upvotes.push(userId)
      await notificationService.create({
        type: 'upvote',
        recipient: project.maker,
        sender: userId,
        targetType: 'project',
        targetId: project._id,
      })
    }

    await project.save()
    res.json({ upvoteCount: project.upvotes.length, upvoted: !hasUpvoted })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, toggleUpvote }
