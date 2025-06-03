declare namespace NodeJS {
  export interface ProcessEnv {
    MONGODB_URI: string;
    MONGODB_DB_NAME: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    PORT: number;
  }
}
