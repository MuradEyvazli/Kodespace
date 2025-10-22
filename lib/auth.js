import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          bio: user.bio,
          location: user.location,
          websiteUrl: user.websiteUrl,
          githubUsername: user.githubUsername,
          linkedinUrl: user.linkedinUrl,
          twitter: user.twitter,
          skills: user.skills,
          stats: user.stats,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.bio = user.bio;
        token.location = user.location;
        token.websiteUrl = user.websiteUrl;
        token.githubUsername = user.githubUsername;
        token.linkedinUrl = user.linkedinUrl;
        token.twitter = user.twitter;
        token.skills = user.skills;
        token.stats = user.stats;
      }

      // Handle session updates (e.g., profile edits)
      if (trigger === 'update' && session) {
        // Merge the updated session data into token
        return {
          ...token,
          ...session,
          // Preserve token ID if not in session update
          id: session.id || token.id
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.bio = token.bio;
        session.user.location = token.location;
        session.user.websiteUrl = token.websiteUrl;
        session.user.githubUsername = token.githubUsername;
        session.user.linkedinUrl = token.linkedinUrl;
        session.user.twitter = token.twitter;
        session.user.skills = token.skills;
        session.user.stats = token.stats;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getSession = () => getServerSession(authOptions);