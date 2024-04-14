import { serverApi } from '@/serverApi';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: 'email', placeholder: 'email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { status, body } = await serverApi.users.login({
          headers: {
            authorization: 'Basic ' + btoa(`${credentials?.email}:${credentials?.password}`),
          },
        });

        if (status === 404 || status === 500) {
          // throw new Error(body.message);
          return null;
        }

        const user = { ...body.user, token: body.token };
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  // session: {
  //   maxAge: SESSION_MAX_AGE, //* [default is 30 days -> 30 * 24 * 60 * 60];
  // },
  callbacks: {
    // signIn: async ({ user, account, profile, email, credentials }) => {
    //   return true;
    // },
    jwt: async ({ token, trigger, user }) => {
      if (trigger === 'signIn') {
        token.name = user.name;
        token.email = user.email;
        token.user = {
          id: user.id!,
          name: user.name!,
          email: user.email!,
          emailVerified: null,
          token: user.token,
          role: user.role,
        };
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user;
      return session;
    },
  },
} satisfies NextAuthConfig;
