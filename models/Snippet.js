import mongoose from 'mongoose';

const SnippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: 200,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: 1000,
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    lowercase: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: [
      'algorithm',
      'data-structure',
      'web-development',
      'mobile-development',
      'api',
      'database',
      'ui-component',
      'utility',
      'performance',
      'security',
      'other'
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  verificationNotes: {
    type: String,
    default: '',
  },
  license: {
    type: String,
    enum: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Public Domain'],
    default: 'MIT',
  },
  usage: {
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
    },
    copies: {
      type: Number,
      default: 0,
    },
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  pendingVerification: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

SnippetSchema.index({ author: 1 });
SnippetSchema.index({ language: 1 });
SnippetSchema.index({ category: 1 });
SnippetSchema.index({ isVerified: 1 });
SnippetSchema.index({ tags: 1 });
SnippetSchema.index({ 'usage.views': -1 });
SnippetSchema.index({ 'usage.likes': -1 });
SnippetSchema.index({ createdAt: -1 });

export default mongoose.models.Snippet || mongoose.model('Snippet', SnippetSchema);