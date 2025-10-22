import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.image; // Password required only if not OAuth user
    },
    minLength: 6,
  },
  image: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: [
      'junior-developer',
      'mid-level-developer',
      'senior-developer',
      'lead-developer',
      'principal-engineer',
      'moderator',
      'admin'
    ],
    default: 'junior-developer',
  },
  bio: {
    type: String,
    maxLength: 500,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  githubUsername: {
    type: String,
    default: '',
  },
  linkedinUrl: {
    type: String,
    default: '',
  },
  websiteUrl: {
    type: String,
    default: '',
  },
  twitter: {
    type: String,
    default: '',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  stats: {
    snippetsShared: {
      type: Number,
      default: 0,
    },
    snippetsVerified: {
      type: Number,
      default: 0,
    },
    verificationsMade: {
      type: Number,
      default: 0,
    },
    questionsAnswered: {
      type: Number,
      default: 0,
    },
    reputation: {
      type: Number,
      default: 0,
    },
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

UserSchema.index({ role: 1 });
UserSchema.index({ 'stats.reputation': -1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);