import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test_jwt_secret_key_123456789';
  process.env.JWT_EXPIRES_IN = '1h';
});

afterAll(async () => {
  if (mongod) {
    await mongod.stop();
  }
});

// Increase timeout for tests
jest.setTimeout(60000);
