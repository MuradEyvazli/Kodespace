import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Snippet from '@/models/Snippet';
import User from '@/models/User';

// GET /api/snippets/[id] - Get single snippet
export async function GET(req, { params }) {
  try {
    await connectDB();

    const snippet = await Snippet.findById(params.id)
      .populate('author', 'name email role image')
      .populate('verifiedBy', 'name email role')
      .populate('comments.author', 'name email role image')
      .lean();

    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      );
    }

    // Check if snippet is private
    const session = await getSession();
    if (snippet.isPrivate && (!session || session.user.email !== snippet.author.email)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Increment view count
    await Snippet.findByIdAndUpdate(params.id, {
      $inc: { 'usage.views': 1 }
    });

    snippet.usage.views += 1; // Update the response object

    return NextResponse.json({ snippet });
  } catch (error) {
    console.error('Get snippet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/snippets/[id] - Update snippet
export async function PUT(req, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const snippet = await Snippet.findById(params.id);
    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      );
    }

    // Check ownership
    const user = await User.findOne({ email: session.user.email });
    if (!user || snippet.author.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const updateData = await req.json();

    // Remove fields that shouldn't be updated directly
    delete updateData.author;
    delete updateData.isVerified;
    delete updateData.verifiedBy;
    delete updateData.verifiedAt;
    delete updateData.usage;
    delete updateData.likedBy;
    delete updateData.bookmarkedBy;
    delete updateData.comments;

    const updatedSnippet = await Snippet.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email role');

    return NextResponse.json({
      message: 'Snippet updated successfully',
      snippet: updatedSnippet
    });
  } catch (error) {
    console.error('Update snippet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/snippets/[id] - Delete snippet
export async function DELETE(req, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const snippet = await Snippet.findById(params.id);
    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin role
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isOwner = snippet.author.toString() === user._id.toString();
    const isAdmin = ['admin', 'moderator'].includes(user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await Snippet.findByIdAndDelete(params.id);

    // Update user stats if owner is deleting
    if (isOwner) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.snippetsShared': -1 }
      });
    }

    return NextResponse.json({
      message: 'Snippet deleted successfully'
    });
  } catch (error) {
    console.error('Delete snippet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}