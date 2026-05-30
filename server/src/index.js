const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const http = require('http')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')
const passport = require('./config/passport')
const { Server } = require('socket.io')
const notificationService = require('./services/notificationService')
const dmController = require('./controllers/dmController')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// ── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
})

notificationService.init(io)
dmController.setIo(io)

io.on('connection', (socket) => {
  socket.on('join', ({ userId }) => {
    if (userId) socket.join(`user:${userId}`)
  })
  socket.on('leave', ({ userId }) => {
    if (userId) socket.leave(`user:${userId}`)
  })
})

// ── MongoDB ───────────────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/buildershub')
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}
connectDB()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/posts', require('./routes/posts'))
app.use('/api/discussions', require('./routes/discussions'))
app.use('/api/comments', require('./routes/comments'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/search', require('./routes/search'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/bookmarks', require('./routes/bookmarks'))
app.use('/api/dm', require('./routes/dm'))
app.use('/api/collections', require('./routes/collections'))
app.use('/api/leaderboard', require('./routes/leaderboard'))

// ── Error handlers ────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error', errors: err.errors || [] })
})

server.listen(PORT, () => console.log(`BuildersHub server running on port ${PORT}`))

module.exports = app
