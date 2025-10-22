import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse form data
    const formData = await request.formData();

    // Extract fields - matching frontend form field names
    const profileData = {
      name: formData.get('name'),
      email: formData.get('email'),
      bio: formData.get('bio') || '',
      location: formData.get('location') || '',
      websiteUrl: formData.get('websiteUrl') || '',
      githubUsername: formData.get('githubUsername') || '',
      linkedinUrl: formData.get('linkedinUrl') || '',
      twitter: formData.get('twitter') || '',
      skills: JSON.parse(formData.get('skills') || '[]')
    };

    const profilePicture = formData.get('profilePicture');

    // Validate required fields
    if (!profileData.name || !profileData.email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (profileData.email !== session.user.email) {
      const existingUser = await User.findOne({
        email: profileData.email,
        _id: { $ne: session.user.id }
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Handle profile picture upload
    let profilePictureUrl = null;
    if (profilePicture && profilePicture.size > 0) {
      // In a real application, you would upload to a cloud storage service
      // For now, we'll simulate the upload
      const bytes = await profilePicture.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a unique filename
      const fileName = `profile_${session.user.id}_${Date.now()}.${profilePicture.name.split('.').pop()}`;

      // In production, upload to S3, Cloudinary, etc.
      // For demo purposes, we'll just create a placeholder URL
      profilePictureUrl = `/uploads/profiles/${fileName}`;

      console.log(`Profile picture would be saved as: ${fileName}, Size: ${buffer.length} bytes`);
    }

    // Update user in database
    const updateData = {
      name: profileData.name,
      email: profileData.email,
      bio: profileData.bio,
      location: profileData.location,
      websiteUrl: profileData.websiteUrl,
      githubUsername: profileData.githubUsername,
      linkedinUrl: profileData.linkedinUrl,
      twitter: profileData.twitter,
      skills: profileData.skills
    };

    // Add profile picture if uploaded
    if (profilePictureUrl) {
      updateData.image = profilePictureUrl;
    }

    // Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Profile updated successfully:', {
      userId: session.user.id,
      updatedFields: Object.keys(updateData)
    });

    // Return success response with updated user data
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        websiteUrl: updatedUser.websiteUrl,
        githubUsername: updatedUser.githubUsername,
        linkedinUrl: updatedUser.linkedinUrl,
        twitter: updatedUser.twitter,
        skills: updatedUser.skills,
        image: updatedUser.image,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}