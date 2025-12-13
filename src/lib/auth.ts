import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import FacebookProvider from 'next-auth/providers/facebook';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// ============================================================================
// NEXTAUTH CONFIGURATION
// Custom implementation with Supabase PostgreSQL
// ============================================================================

export const authOptions: NextAuthOptions = {
  providers: [
    // ========================================================================
    // CREDENTIALS PROVIDER (Email/Password)
    // ========================================================================
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Find user by email - simplified query
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // ========================================================================
          // ACCOUNT SECURITY CHECKS
          // ========================================================================
          
          // Check if account is currently locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            const unlockTime = user.lockedUntil.toLocaleString();
            throw new Error(`Account is locked until ${unlockTime}. Contact support if needed.`);
          }
          
          // Check if account has exceeded failed attempts (5 attempts = 15 min lock)
          if (user.failedLoginAttempts >= 5) {
            const lockDuration = 15 * 60 * 1000; // 15 minutes
            const lockedUntil = new Date(Date.now() + lockDuration);
            
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                lockedUntil,
                failedLoginAttempts: user.failedLoginAttempts + 1
              }
            });
            
            throw new Error('Too many failed login attempts. Account locked for 15 minutes.');
          }

          // Check password
          if (!user.passwordHash) {
            // Increment failed attempts for missing password
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: user.failedLoginAttempts + 1 }
            });
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordValid) {
            // Increment failed login attempts
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: user.failedLoginAttempts + 1 }
            });
            throw new Error('Invalid email or password');
          }
          
          // ========================================================================
          // SUCCESSFUL LOGIN - RESET SECURITY COUNTERS
          // ========================================================================
          
          // Reset failed attempts and unlock account on successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
              lastLoginIp: null // Could capture IP if needed
            }
          });

          // Check account status
          if (user.accountStatus === 'LOCKED') {
            throw new Error('Account is locked. Contact support.');
          }

          if (user.accountStatus === 'INACTIVE') {
            throw new Error('Account is inactive.');
          }

          if (user.accountStatus === 'ARCHIVED') {
            throw new Error('Account has been archived.');
          }

          if (!user.isActive) {
            throw new Error('Account is disabled.');
          }

          // Return user object for NextAuth
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            tenantId: user.tenantId,
            image: user.avatar
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    }),

    // ========================================================================
    // OAUTH PROVIDERS
    // ========================================================================
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : []),

    ...(process.env.APPLE_CLIENT_ID
      ? [
          AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : []),

    ...(process.env.FACEBOOK_CLIENT_ID
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : [])
  ],

  // ========================================================================
  // SESSION CONFIGURATION
  // ========================================================================
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60 // Update session on every request
  },

  // ========================================================================
  // JWT CONFIGURATION
  // ========================================================================
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60
  },

  // ========================================================================
  // CALLBACKS
  // ========================================================================
  callbacks: {
    async signIn({ user, account }) {
      // Check if OAuth account exists or create it
      if (account?.provider) {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });

        if (!existingUser) {
          // Create new user for OAuth sign-in
          existingUser = await prisma.user.create({
            data: {
              email: user.email!,
              firstName: user.name?.split(' ')[0] || 'User',
              lastName: user.name?.split(' ')[1] || '',
              avatar: user.image,
              role: 'CLIENT',
              accountStatus: 'ACTIVE',
              emailVerified: new Date(),
              passwordHash: null
            }
          });
        }

        // Link OAuth account
        await prisma.oAuthAccount.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          },
          update: {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpires: account.expires_at ? new Date(account.expires_at * 1000) : null,
            lastUsedAt: new Date()
          },
          create: {
            userId: existingUser.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpires: account.expires_at ? new Date(account.expires_at * 1000) : null,
            email: user.email,
            name: user.name,
            image: user.image
          }
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      // Add user properties on initial sign-in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      // Ensure custom fields are preserved on token refresh
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.tenantId = dbUser.tenantId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allow redirects to same site
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },

  // ========================================================================
  // PAGES
  // ========================================================================
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request'
  },

  // ========================================================================
  // EVENTS
  // ========================================================================
  events: {
    async signOut() {
      // Cleanup session if needed
    }
  },

  // ========================================================================
  // DEBUG
  // ========================================================================
  debug: process.env.DEBUG === 'true'
};
