const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Define schemas inline for the seed script
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minLength: 6 },
  image: { type: String, default: null },
  role: {
    type: String,
    enum: ['junior-developer', 'mid-level-developer', 'senior-developer', 'lead-developer', 'principal-engineer', 'moderator', 'admin'],
    default: 'junior-developer',
  },
  bio: { type: String, maxLength: 500, default: '' },
  githubUsername: { type: String, default: null },
  linkedinUrl: { type: String, default: null },
  websiteUrl: { type: String, default: null },
  skills: [{ type: String, trim: true }],
  badges: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  stats: {
    snippetsShared: { type: Number, default: 0 },
    snippetsVerified: { type: Number, default: 0 },
    verificationsMade: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
  },
}, { timestamps: true });

const SnippetSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 200 },
  description: { type: String, required: true, trim: true, maxLength: 1000 },
  code: { type: String, required: true },
  language: { type: String, required: true, lowercase: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['algorithm', 'data-structure', 'web-development', 'mobile-development', 'api', 'database', 'ui-component', 'utility', 'performance', 'security', 'other'],
    required: true,
  },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt: { type: Date, default: null },
  verificationNotes: { type: String, default: '' },
  license: { type: String, enum: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Public Domain'], default: 'MIT' },
  usage: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    copies: { type: Number, default: 0 },
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxLength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],
  isPrivate: { type: Boolean, default: false },
  pendingVerification: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Snippet = mongoose.model('Snippet', SnippetSchema);

const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    role: 'senior-developer',
    bio: 'Full-stack developer with 8 years of experience in React and Node.js',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    stats: {
      snippetsShared: 0,
      snippetsVerified: 0,
      verificationsMade: 0,
      questionsAnswered: 0,
      reputation: 150
    }
  },
  {
    name: 'Bob Chen',
    email: 'bob@example.com',
    password: 'password123',
    role: 'mid-level-developer',
    bio: 'Backend developer specializing in Python and microservices',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    stats: {
      snippetsShared: 0,
      snippetsVerified: 0,
      verificationsMade: 0,
      questionsAnswered: 0,
      reputation: 75
    }
  },
  {
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    password: 'password123',
    role: 'junior-developer',
    bio: 'New to programming, eager to learn and contribute',
    skills: ['JavaScript', 'HTML', 'CSS'],
    stats: {
      snippetsShared: 0,
      snippetsVerified: 0,
      verificationsMade: 0,
      questionsAnswered: 0,
      reputation: 25
    }
  }
];

const sampleSnippets = [
  {
    title: 'React Custom Hook for API Calls',
    description: 'A reusable custom hook for making API calls with loading states, error handling, and automatic cleanup.',
    code: `import { useState, useEffect, useCallback } from 'react';

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;`,
    language: 'javascript',
    tags: ['react', 'hooks', 'api', 'custom-hook'],
    category: 'web-development',
    difficulty: 'intermediate',
    license: 'MIT',
    isVerified: true,
    usage: {
      views: 245,
      likes: 38,
      bookmarks: 22,
      copies: 15
    }
  },
  {
    title: 'Python Binary Search Implementation',
    description: 'Efficient binary search algorithm implementation with detailed comments and time complexity analysis.',
    code: `def binary_search(arr, target):
    """
    Performs binary search on a sorted array.

    Time Complexity: O(log n)
    Space Complexity: O(1)

    Args:
        arr: Sorted list of comparable elements
        target: Element to search for

    Returns:
        Index of target if found, -1 otherwise
    """
    left, right = 0, len(arr) - 1

    while left <= right:
        # Calculate middle index, avoiding overflow
        mid = left + (right - left) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

# Example usage
if __name__ == "__main__":
    numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    target = 7

    result = binary_search(numbers, target)

    if result != -1:
        print(f"Element {target} found at index {result}")
    else:
        print(f"Element {target} not found in array")`,
    language: 'python',
    tags: ['algorithm', 'search', 'binary-search', 'python'],
    category: 'algorithm',
    difficulty: 'beginner',
    license: 'MIT',
    isVerified: true,
    usage: {
      views: 189,
      likes: 31,
      bookmarks: 18,
      copies: 12
    }
  },
  {
    title: 'CSS Flexbox Center Anything',
    description: 'Simple CSS utility classes for centering content using Flexbox. Works for both horizontal and vertical centering.',
    code: `/* Center content horizontally and vertically */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Center only horizontally */
.flex-center-x {
  display: flex;
  justify-content: center;
}

/* Center only vertically */
.flex-center-y {
  display: flex;
  align-items: center;
}

/* Center with flex direction column */
.flex-center-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Example usage in HTML */
/*
<div class="flex-center" style="height: 100vh;">
  <div class="content">
    <h1>Perfectly Centered</h1>
    <p>This content is centered both horizontally and vertically!</p>
  </div>
</div>
*/

/* Responsive centering */
@media (max-width: 768px) {
  .flex-center-responsive {
    flex-direction: column;
    text-align: center;
  }
}`,
    language: 'css',
    tags: ['css', 'flexbox', 'centering', 'layout'],
    category: 'web-development',
    difficulty: 'beginner',
    license: 'Public Domain',
    isVerified: false,
    usage: {
      views: 156,
      likes: 24,
      bookmarks: 31,
      copies: 28
    }
  },
  {
    title: 'JWT Token Validation Middleware',
    description: 'Express.js middleware for JWT token validation with error handling and user extraction.',
    code: `const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (optional, for fresh user data)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = authMiddleware;`,
    language: 'javascript',
    tags: ['nodejs', 'jwt', 'authentication', 'middleware', 'express'],
    category: 'api',
    difficulty: 'intermediate',
    license: 'MIT',
    isVerified: false,
    usage: {
      views: 298,
      likes: 45,
      bookmarks: 38,
      copies: 22
    }
  },
  {
    title: 'Quick Sort Algorithm in Java',
    description: 'Efficient implementation of the Quick Sort algorithm with detailed comments and complexity analysis.',
    code: `public class QuickSort {

    /**
     * Sorts an array using the Quick Sort algorithm
     * Time Complexity: O(n log n) average, O(n²) worst case
     * Space Complexity: O(log n) due to recursion
     */
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            // Partition the array and get pivot index
            int pivotIndex = partition(arr, low, high);

            // Recursively sort elements before and after partition
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }

    /**
     * Partitions the array around a pivot element
     */
    private static int partition(int[] arr, int low, int high) {
        // Choose rightmost element as pivot
        int pivot = arr[high];

        // Index of smaller element (indicates right position of pivot)
        int i = low - 1;

        for (int j = low; j < high; j++) {
            // If current element is smaller than or equal to pivot
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }

        // Place pivot at correct position
        swap(arr, i + 1, high);
        return i + 1;
    }

    /**
     * Swaps two elements in an array
     */
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    // Example usage
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};

        System.out.println("Original array:");
        printArray(arr);

        quickSort(arr, 0, arr.length - 1);

        System.out.println("Sorted array:");
        printArray(arr);
    }

    private static void printArray(int[] arr) {
        for (int value : arr) {
            System.out.print(value + " ");
        }
        System.out.println();
    }
}`,
    language: 'java',
    tags: ['java', 'algorithm', 'sorting', 'quicksort', 'recursion'],
    category: 'algorithm',
    difficulty: 'advanced',
    license: 'MIT',
    isVerified: true,
    usage: {
      views: 203,
      likes: 29,
      bookmarks: 16,
      copies: 11
    }
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Snippet.deleteMany({});
    console.log('Cleared existing data');

    // Create users with hashed passwords
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      users.push(user);
    }
    console.log('Created sample users');

    // Create snippets with user references
    for (let i = 0; i < sampleSnippets.length; i++) {
      const snippetData = sampleSnippets[i];
      const author = users[i % users.length]; // Distribute snippets among users

      const snippet = await Snippet.create({
        ...snippetData,
        author: author._id,
        verifiedBy: snippetData.isVerified ? users[0]._id : null, // Alice verifies
        verifiedAt: snippetData.isVerified ? new Date() : null
      });

      // Update user stats
      await User.findByIdAndUpdate(author._id, {
        $inc: {
          'stats.snippetsShared': 1,
          'stats.snippetsVerified': snippetData.isVerified ? 1 : 0
        }
      });
    }
    console.log('Created sample snippets');

    // Update verifier stats
    if (users[0]) {
      await User.findByIdAndUpdate(users[0]._id, {
        $inc: { 'stats.verificationsMade': 3 } // Alice verified 3 snippets
      });
    }

    console.log('✅ Seed data created successfully!');
    console.log('\\n📋 Test Users:');
    console.log('1. alice@example.com (Senior Developer) - can verify');
    console.log('2. bob@example.com (Mid-level Developer)');
    console.log('3. charlie@example.com (Junior Developer)');
    console.log('\\nPassword for all: password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedData();