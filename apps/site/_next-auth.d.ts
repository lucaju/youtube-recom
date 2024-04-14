import type { DefaultSession } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: Date | null;
      token: string;
      role: string;
    };
  }
}

declare module 'next-auth' {
  interface User extends DefaultSession['user'] {
    role: string;
    token: string;
  }

  interface Session {
    access_token?: string;
    user: {
      id: string;
      role: string;
      token: string;
    } & DefaultSession['user'];
  }
}
