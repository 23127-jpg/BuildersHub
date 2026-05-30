const cron = require('node-cron')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const Project = require('../models/Project')
const Notification = require('../models/Notification')
const Comment = require('../models/Comment')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

const aggregateWeeklyStats = async (userId) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const projects = await Project.find({ maker: userId, status: 'active' })
  if (!projects.length) return null

  const projectIds = projects.map((p) => p._id)

  // New upvotes this week (approximate via notification count)
  const upvotes = await Notification.countDocuments({
    recipient: userId, type: 'upvote', createdAt: { $gte: since },
  })

  // New followers this week
  const newFollowers = await Notification.countDocuments({
    recipient: userId, type: 'follow', createdAt: { $gte: since },
  })

  // New comments this week
  const newComments = await Comment.countDocuments({
    targetType: 'project', targetId: { $in: projectIds }, createdAt: { $gte: since },
  })

  return { projectCount: projects.length, upvotes, newFollowers, newComments }
}

const sendDigestEmail = async (email, name, stats) => {
  await transporter.sendMail({
    from: `"BuildersHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🚀 Your BuildersHub Weekly Digest',
    html: `
      <h2>Hey ${name}, here's your week in review!</h2>
      <ul>
        <li>🔼 <strong>${stats.upvotes}</strong> new upvotes on your projects</li>
        <li>👥 <strong>${stats.newFollowers}</strong> new followers</li>
        <li>💬 <strong>${stats.newComments}</strong> new comments on your projects</li>
      </ul>
      <p>Keep building in public! 🔥</p>
      <a href="${process.env.CLIENT_URL}">Visit BuildersHub</a>
    `,
  })
}

// Every Monday at 00:00 UTC
cron.schedule('0 0 * * 1', async () => {
  console.log('[Cron] Running weekly digest...')
  const users = await User.find({}).select('name email')

  for (const user of users) {
    try {
      const stats = await aggregateWeeklyStats(user._id)
      if (!stats) continue
      await sendDigestEmail(user.email, user.name, stats)
    } catch (err) {
      console.error(`[Cron] Failed to send digest to ${user._id}:`, err.message)
    }
  }

  console.log('[Cron] Weekly digest complete.')
})

module.exports = {}
