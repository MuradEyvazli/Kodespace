import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

    const { currentPassword, newPassword } = await request.json();

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Fetch user from database
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Cannot change password for OAuth users' },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    console.log('Updating password for user:', session.user.id);
    console.log('Old password hash (first 20 chars):', user.password.substring(0, 20));
    console.log('New password hash (first 20 chars):', hashedNewPassword.substring(0, 20));

    // Update password in database
    user.password = hashedNewPassword;
    await user.save();

    console.log('Password updated successfully for user:', session.user.id);

    // Verify the password was saved correctly
    const updatedUser = await User.findById(session.user.id);
    console.log('Saved password hash (first 20 chars):', updatedUser.password.substring(0, 20));

    // Test if the new password works
    const testVerify = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('Password verification test:', testVerify ? 'SUCCESS' : 'FAILED');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}