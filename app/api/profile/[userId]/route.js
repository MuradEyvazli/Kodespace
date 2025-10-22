import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Snippet from '@/models/Snippet';

export async function GET(request, { params }) {
  try {
    // Await params for Next.js 15
    const { userId } = await params;

    // Connect to database
    await connectDB();

    // Get user by ID
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get real snippet counts from database
    const totalSnippets = await Snippet.countDocuments({ author: userId });
    const verifiedSnippets = await Snippet.countDocuments({
      author: userId,
      isVerified: true
    });

    // Get total likes across all user's snippets
    const snippetsWithLikes = await Snippet.find({ author: userId }).select('usage.likes');
    const totalLikes = snippetsWithLikes.reduce((sum, snippet) => sum + (snippet.usage?.likes || 0), 0);

    // Get total bookmarks across all user's snippets
    const snippetsWithBookmarks = await Snippet.find({ author: userId }).select('usage.bookmarks');
    const totalBookmarks = snippetsWithBookmarks.reduce((sum, snippet) => sum + (snippet.usage?.bookmarks || 0), 0);

    // Get verification count (how many snippets this user has verified)
    const verificationsCount = await Snippet.countDocuments({
      verifiedBy: userId,
      isVerified: true
    });

    // Calculate reputation based on real data
    const calculatedReputation = (totalSnippets * 10) + (verifiedSnippets * 25) + (totalLikes * 2) + (totalBookmarks * 5) + (verificationsCount * 15);

    // Return user data with real stats
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        websiteUrl: user.websiteUrl,
        githubUsername: user.githubUsername,
        linkedinUrl: user.linkedinUrl,
        twitter: user.twitter,
        skills: user.skills,
        role: user.role,
        stats: {
          snippetsShared: totalSnippets,
          snippetsVerified: verifiedSnippets,
          verificationsMade: verificationsCount,
          reputation: calculatedReputation,
          totalLikes: totalLikes,
          totalBookmarks: totalBookmarks
        },
        badges: user.badges,
        image: user.image,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
