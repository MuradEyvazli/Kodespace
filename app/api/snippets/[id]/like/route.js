import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Snippet from '@/models/Snippet';
import User from '@/models/User';

// POST /api/snippets/[id]/like - Toggle like
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

    const userLiked = snippet.likedBy.includes(user._id);

    if (userLiked) {
      // Unlike
      await Snippet.findByIdAndUpdate(params.id, {
        $pull: { likedBy: user._id },
        $inc: { 'usage.likes': -1 }
      });
    } else {
      // Like
      await Snippet.findByIdAndUpdate(params.id, {
        $addToSet: { likedBy: user._id },
        $inc: { 'usage.likes': 1 }
      });
    }

    return NextResponse.json({
      message: userLiked ? 'Snippet unliked' : 'Snippet liked',
      liked: !userLiked
    });
  } catch (error) {
    console.error('Like snippet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}