'use client';

import { SessionProvider } from 'next-auth/react';

interface Props {
  children?: React.ReactNode;
}

//* Refetch server to avoid session expiration
//* Causes a side-effect that refresh 'authorization_token'
// Must be lower than the value of the session 'maxAge' session option.
const REFETCH_INTERVAL = 2 * 50 * 60; //* 2h:50m

export const NextAuthProvider = ({ children }: Props) => {
  return (
    <SessionProvider
      refetchInterval={REFETCH_INTERVAL}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
};
