declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;

    PORT: string;
    JWT_SECRET: string;
    SESSION_SECRET: string;

    MONGODB_URL: string;
    DATABASE: string;

    ADMIN_EMAIL: string;
    ADMIN_NAME: string;
    ADMIN_PWD: string;

    GMAIL_APP_SPECIFIC_PWD: string;
    DISCORD_WEBHOOK_URL: string;
  }
}
