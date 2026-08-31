import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendTelegramLoginAlert } from '@/lib/telegram';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours session expiry
    updateAge: 60 * 60, // refresh session every 1 hour
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours JWT token expiry
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        magicToken: { label: 'MagicToken', type: 'text' },
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        // 1. Passwordless Magic Login Token Authentication
        if (credentials?.magicToken && typeof credentials.magicToken === 'string') {
          try {
            const { validateAndConsumeMagicToken } = await import('@/lib/magic-auth');
            const magicRes = await validateAndConsumeMagicToken(credentials.magicToken);
            if (magicRes.success && magicRes.user) {
              return {
                id: magicRes.user.id,
                name: magicRes.user.name,
                email: magicRes.user.email,
                role: magicRes.user.role,
              };
            }
          } catch (magicErr) {
            console.error('Magic token auth error:', magicErr);
          }
          return null;
        }

        // 2. Standard Email + Password Authentication
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        try {
          const userList = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!userList || userList.length === 0) {
            return null;
          }

          const user = userList[0];
          const isValid = await bcrypt.compare(password, user.passwordHash);

          if (!isValid) {
            return null;
          }

          // Update lastLoginAt
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));

          // Trigger Telegram login notification
          try {
            await sendTelegramLoginAlert({
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              userPhone: user.phone,
              role: user.role,
              loginTime: new Date(),
            });
          } catch (tgErr) {
            console.error('Failed to trigger Telegram login notification:', tgErr);
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        const email = user.email.toLowerCase().trim();

        try {
          const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (existingUsers && existingUsers.length > 0) {
            const existing = existingUsers[0];
            user.id = existing.id;
            (user as any).role = existing.role;

            await db
              .update(users)
              .set({
                lastLoginAt: new Date(),
                image: user.image || existing.image,
              })
              .where(eq(users.id, existing.id));
          } else {
            // Auto-create new user for Google Sign-In
            const randomPassHash = await bcrypt.hash(crypto.randomUUID(), 10);
            const [newUser] = await db
              .insert(users)
              .values({
                name: user.name || 'عميل GROWIX',
                email,
                passwordHash: randomPassHash,
                image: user.image || null,
                role: 'user',
              })
              .returning();

            user.id = newUser.id;
            (user as any).role = newUser.role;

            // Send Telegram alert for new Google user
            try {
              const { sendTelegramNewUserAlert } = await import('@/lib/telegram');
              await sendTelegramNewUserAlert({
                userId: newUser.id,
                userName: newUser.name,
                userEmail: newUser.email,
                role: newUser.role,
                source: 'google_oauth',
                createdAt: newUser.createdAt,
              });
            } catch (tgErr) {
              console.error('Failed to send telegram alert for google registration:', tgErr);
            }
          }
          return true;
        } catch (err) {
          console.error('Error during Google sign in callback:', err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.picture = user.image || token.picture;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
        session.user.image = token.picture || session.user.image;
      }
      return session;
    },
  },
});
