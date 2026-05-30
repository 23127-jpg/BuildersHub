const Project = require('../models/Project')
const User = require('../models/User')
const Post = require('../models/Post')

/** GET /api/search?q=...&type=projects|users|posts&tag=...&sort=... */
const search = async (req, res) => {
  try {
    const { q, type, tag, sort } = req.query

    if (!q || q.length < 2) return res.status(400).json({ message: 'Search query must be at least 2 characters.' })

    if (type === 'projects') {
      const filter = { $text: { $search: q }, status: 'active' }
      if (tag) filter.tags = tag

      let sortObj = { score: { $meta: 'textScore' } }
      if (sort === 'newest') sortObj = { launchDate: -1 }
      else if (sort === 'most_commented') sortObj = { commentsCount: -1 }

      const projects = await Project.find(filter, { score: { $meta: 'textScore' } })
        .populate('maker', 'name username avatar')
        .sort(sortObj)
        .limit(50)

      if (sort !== 'newest' && sort !== 'most_commented') {
        projects.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
      }

      return res.json(projects)
    }

    if (type === 'users') {
      const users = await User.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
        .select('name username avatar bio skills followers')
        .sort({ score: { $meta: 'textScore' } })
        .limit(50)

      users.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0))
      return res.json(users)
    }

    if (type === 'posts') {
      const posts = await Post.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
        .populate('author', 'name username avatar')
        .sort({ score: { $meta: 'textScore' } })
        .limit(50)

      posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      return res.json(posts)
    }

    res.status(400).json({ message: 'type must be one of: projects, users, posts' })
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { search }
