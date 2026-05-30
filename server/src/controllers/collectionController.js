const Collection = require('../models/Collection')

/** POST /api/collections */
const createCollection = async (req, res) => {
  try {
    const { name, visibility } = req.body
    if (!name || !name.trim()) return res.status(400).json({ message: 'Collection name is required.' })
    if (name.length > 50) return res.status(400).json({ message: 'Collection name must not exceed 50 characters.' })
    const collection = await Collection.create({ name: name.trim(), owner: req.user._id, visibility: visibility || 'public' })
    res.status(201).json(collection)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** GET /api/collections/:id */
const getCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('owner', 'name username avatar')
      .populate('projects', 'title tagline logo upvotes tags')
    if (!collection) return res.status(404).json({ message: 'Collection not found.' })
    if (collection.visibility === 'private' && !collection.owner._id.equals(req.user?._id))
      return res.status(404).json({ message: 'Collection not found.' })
    res.json(collection)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/collections/:id/projects */
const addProject = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
    if (!collection) return res.status(404).json({ message: 'Collection not found.' })
    if (!collection.owner.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' })
    const { projectId } = req.body
    if (!collection.projects.map(String).includes(projectId)) collection.projects.push(projectId)
    await collection.save()
    res.json(collection)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

/** POST /api/collections/:id/follow */
const followCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
    if (!collection || collection.visibility === 'private') return res.status(404).json({ message: 'Collection not found.' })
    if (!collection.followers.map(String).includes(req.user._id.toString()))
      collection.followers.push(req.user._id)
    await collection.save()
    res.json({ followerCount: collection.followers.length })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { createCollection, getCollection, addProject, followCollection }
