declare namespace NodeJS {
  export interface ProcessEnv {
    AUTH_SECRET: string;
    NEXT_PUBLIC_AUTH_SECRET: string;
    NEXT_PUBLIC_SERVER_API_URL: string;
  }
}
