import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Snippet from '@/models/Snippet';
import User from '@/models/User';

// POST /api/snippets/[id]/bookmark - Toggle bookmark
export async function POST(req, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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

    const userBookmarked = snippet.bookmarkedBy.includes(user._id);

    if (userBookmarked) {
      // Remove bookmark
      await Snippet.findByIdAndUpdate(params.id, {
        $pull: { bookmarkedBy: user._id },
        $inc: { 'usage.bookmarks': -1 }
      });
    } else {
      // Add bookmark
      await Snippet.findByIdAndUpdate(params.id, {
        $addToSet: { bookmarkedBy: user._id },
        $inc: { 'usage.bookmarks': 1 }
      });
    }

    return NextResponse.json({
      message: userBookmarked ? 'Bookmark removed' : 'Snippet bookmarked',
      bookmarked: !userBookmarked
    });
  } catch (error) {
    console.error('Bookmark snippet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}