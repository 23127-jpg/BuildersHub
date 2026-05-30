const Project = require('../models/Project')
const User = require('../models/User')

/** GET /api/leaderboard */
const getLeaderboard = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Aggregate upvotes per maker in the past 7 days
    const results = await Project.aggregate([
      { $match: { status: 'active', launchDate: { $gte: since } } },
      { $project: { maker: 1, upvoteCount: { $size: '$upvotes' } } },
      { $group: { _id: '$maker', totalUpvotes: { $sum: '$upvoteCount' } } },
      { $sort: { totalUpvotes: -1 } },
      { $limit: 10 },
    ])

    // Enrich with user data and new follower count
    const enriched = await Promise.all(
      results.map(async (r, i) => {
        const user = await User.findById(r._id).select('name username avatar followers')
        const newFollowers = user ? user.followers.length : 0
        return {
          rank: i + 1,
          user: user ? { id: user._id, name: user.name, username: user.username, avatar: user.avatar } : null,
          totalUpvotes: r.totalUpvotes,
          newFollowers,
        }
      })
    )

    res.json(enriched.filter((e) => e.user !== null))
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getLeaderboard }
