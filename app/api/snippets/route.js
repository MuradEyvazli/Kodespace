import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Snippet from '@/models/Snippet';
import User from '@/models/User';

// GET /api/snippets - List snippets with filtering
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    const isVerified = searchParams.get('verified');
    const authorId = searchParams.get('author');

    // Build filter object
    const filter = { isPrivate: false };

    if (category) filter.category = category;
    if (language) filter.language = new RegExp(language, 'i');
    if (isVerified === 'true') filter.isVerified = true;
    if (authorId) filter.author = authorId;

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const snippets = await Snippet.find(filter)
      .populate('author', 'name email role')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Snippet.countDocuments(filter);

    return NextResponse.json({
      snippets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get snippets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/snippets - Create new snippet
export async function POST(req) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const {
      title,
      description,
      code,
      language,
      tags,
      category,
      difficulty,
      license,
      isPrivate
    } = await req.json();

    // Validation
    if (!title || !description || !code || !language || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create snippet
    const snippet = await Snippet.create({
      title,
      description,
      code,
      language: language.toLowerCase(),
      tags: tags || [],
      author: user._id,
      category,
      difficulty,
      license: license || 'MIT',
      isPrivate: isPrivate || false
    });

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'stats.snippetsShared': 1 }
    });

    // Populate author info
    await snippet.populate('author', 'name email role');

    return NextResponse.json(
      { message: 'Snippet created successfully', snippet },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create snippet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}