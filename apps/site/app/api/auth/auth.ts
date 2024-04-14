import { serverApi } from '@/serverApi';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/* The code block is defining the authentication options for NextAuth. */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
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

        console.log(status, body);

        if (status === 404 || status === 500) {
          throw new Error(body.message);
          return null;
        }

        const user = { ...body.user, token: body.token };
        return user;
      },
    }),
  ],
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
          id: user.id,
          name: user.name,
          email: user.email,
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
};
