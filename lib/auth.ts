import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
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
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
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
          };
        } catch (error) {
          console.error('Auth authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
      }
      return session;
    },
  },
});
