import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Snippet from '@/models/Snippet';
import User from '@/models/User';

// POST /api/snippets/[id]/comments - Add comment
export async function POST(req, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Comment too long (max 500 characters)' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const snippet = await Snippet.findById(params.id);
    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      );
    }

    const comment = {
      author: user._id,
      content: content.trim(),
      createdAt: new Date()
    };

    await Snippet.findByIdAndUpdate(params.id, {
      $push: { comments: comment }
    });

    // Populate the comment author info for response
    await User.populate(comment, { path: 'author', select: 'name email role image' });

    return NextResponse.json({
      message: 'Comment added successfully',
      comment
    }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}