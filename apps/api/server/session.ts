import session from 'express-session';
import memorystore from 'memorystore';

const MemoryStore = memorystore(session);

export const memoryStore = new MemoryStore({
  checkPeriod: 86400000, // prune expired entries every 24h
});

export const Session = session({
  resave: false,
  saveUninitialized: true,
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  secret: process.env.SESSION_SECRET ?? 'My Secrect',
  store: memoryStore,
});
