const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // null for OAuth users
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
      default: '', // Cloudinary URL
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    skills: [
      {
        type: String,
      },
    ],
    githubUrl: {
      type: String,
      default: '',
    },
    portfolioUrl: {
      type: String,
      default: '',
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastPostDate: {
      type: Date,
    },
    themePreference: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    refreshToken: {
      type: String, // hashed, server-side only
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Disable automatic createdAt/updatedAt from timestamps option
    // since createdAt is defined manually in the schema
    timestamps: false,
  }
);

// Text indexes for search on name and bio
userSchema.index({ name: 'text', bio: 'text' });

const User = mongoose.model('User', userSchema);

module.exports = User;
