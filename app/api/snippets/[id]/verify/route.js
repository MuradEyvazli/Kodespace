import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Snippet from '@/models/Snippet';
import User from '@/models/User';

// POST /api/snippets/[id]/verify - Verify snippet (Senior+ only)
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

    // Check if user has permission to verify (Senior+ roles)
    const allowedRoles = ['senior-developer', 'lead-developer', 'principal-engineer', 'moderator', 'admin'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Senior+ role required.' },
        { status: 403 }
      );
    }

    const snippet = await Snippet.findById(params.id);
    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      );
    }

    if (snippet.isVerified) {
      return NextResponse.json(
        { error: 'Snippet is already verified' },
        { status: 400 }
      );
    }

    const { notes } = await req.json();

    // Update snippet
    await Snippet.findByIdAndUpdate(params.id, {
      isVerified: true,
      verifiedBy: user._id,
      verifiedAt: new Date(),
      verificationNotes: notes || '',
      pendingVerification: false
    });

    // Update verifier stats
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'stats.verificationsMade': 1 }
    });

    // Update author stats
    await User.findByIdAndUpdate(snippet.author, {
      $inc: { 'stats.snippetsVerified': 1, 'stats.reputation': 10 }
    });

    return NextResponse.json({
      message: 'Snippet verified successfully'
    });
  } catch (error) {
    console.error('Verify snippet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/snippets/[id]/verify - Remove verification
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

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has permission (Lead+ or original verifier)
    const allowedRoles = ['lead-developer', 'principal-engineer', 'moderator', 'admin'];
    const snippet = await Snippet.findById(params.id);

    if (!snippet) {
      return NextResponse.json(
        { error: 'Snippet not found' },
        { status: 404 }
      );
    }

    const isOriginalVerifier = snippet.verifiedBy && snippet.verifiedBy.toString() === user._id.toString();
    const hasHigherRole = allowedRoles.includes(user.role);

    if (!isOriginalVerifier && !hasHigherRole) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!snippet.isVerified) {
      return NextResponse.json(
        { error: 'Snippet is not verified' },
        { status: 400 }
      );
    }

    // Update snippet
    await Snippet.findByIdAndUpdate(params.id, {
      isVerified: false,
      verifiedBy: null,
      verifiedAt: null,
      verificationNotes: '',
      pendingVerification: false
    });

    // Update author stats (decrease)
    await User.findByIdAndUpdate(snippet.author, {
      $inc: { 'stats.snippetsVerified': -1, 'stats.reputation': -10 }
    });

    return NextResponse.json({
      message: 'Verification removed successfully'
    });
  } catch (error) {
    console.error('Remove verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}