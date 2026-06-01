<<<<<<< HEAD
# BuildersHub 🚀

> **Where builders ship in public.**

A full-stack community platform for developers to share their journey, launch side projects, and get real feedback — combining the best of Reddit, ProductHunt, and Twitter into one focused space for builders.

---

## ✨ Features

### 🚀 Project Launches (ProductHunt-style)
- Submit projects with logo, screenshots, description, tags
- Launch board ranked by upvotes (Today / This week / All time)
- One upvote per user (toggle), comment threads, project changelogs
- AI-powered description generator and tag suggester (Gemini API)

### 📝 Posts & Feed (Twitter-style)
- Short updates (max 280 chars) with image support
- Post types: Update, Question, Resource, Poll
- Like, repost, emoji reactions (🔥 🚀 💡 👏)
- Personalized feed from followed builders + trending feed

### 💬 Discussions (Reddit-style)
- Long-form threads with flair system (Feedback Needed, Show Off, Question, Resource)
- Upvote/downvote, nested comments (2 levels), flair filtering

### 👤 Builder Profiles
- Avatar, bio, skills, GitHub/portfolio links
- Activity graph (GitHub-style 52-week heatmap)
- Builder streaks with milestone notifications (7, 30, 100 days)
- Follow/unfollow system with suggested builders

### 🔔 Real-time Notifications
- Socket.io powered — instant delivery for likes, comments, follows, upvotes
- Bell icon with unread count badge
- Mark all as read

### 💌 Direct Messages
- Mutual-follow gated (no spam)
- Real-time delivery via Socket.io
- Thread list with unread count

### 🔖 Bookmarks & Collections
- Save posts/projects to private bookmarks
- Create public/private curated project collections

### 🏆 Builder Leaderboard
- Weekly top-10 builders by upvotes received
- Resets every Monday

### 🔍 Search
- Full-text search across projects, builders, and posts
- Filter by tag, sort by newest / most upvoted / most commented

### 🤖 AI Features (Google Gemini)
- Generate polished project descriptions from bullet points
- Auto-suggest relevant tags from title + description
- Weekly digest email (upvotes, followers, comments summary)

### 🌙 Dark / Light Mode
- Dark-first design with full light mode support
- Persisted in localStorage + user profile

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Redux Toolkit, React Router v6, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Real-time | Socket.io |
| Auth | JWT (access + refresh tokens), Google OAuth 2.0 |
| File Uploads | Multer + Cloudinary |
| Email | Nodemailer |
| AI | Google Gemini API |
| HTTP Client | Axios + TanStack React Query |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Google Cloud OAuth 2.0 credentials
- Cloudinary account
- Google Gemini API key

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/buildershub.git
cd buildershub
```

### 2. Set up the server
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 3. Set up the client
```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

### 4. Environment Variables

**server/.env**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
buildershub/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Shared UI components
│       ├── pages/          # Route-level page components
│       ├── store/          # Redux slices
│       └── services/       # Axios instance
│
└── server/                 # Express backend
    └── src/
        ├── controllers/    # Route handlers
        ├── models/         # Mongoose schemas
        ├── routes/         # Express routers
        ├── middleware/      # Auth, upload middleware
        ├── services/        # Notification service
        ├── config/          # Passport OAuth config
        ├── utils/           # Cloudinary, token helpers
        └── cron/            # Weekly digest job
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Netlify |
| Backend | Render / Railway |
| Database | MongoDB Atlas |
| Media | Cloudinary CDN |

---

## 📄 License

MIT
=======
# BuildersHub
A community platform where developers share, launch, and grow their side projects — Reddit + ProductHunt + Twitter for builders.
>>>>>>> 3b3c82ccacd3411ecbacf76c9a9b206c8122f09c
