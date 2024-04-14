import NextAuth from 'next-auth';
import authConfig from './auth.config';

/* The code block is defining the authentication options for NextAuth. */
export const { auth, handlers, signIn, signOut } = NextAuth({ ...authConfig });
