const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.join(__dirname, 'test-db.sqlite');

global.testDbPath = TEST_DB_PATH;

beforeAll(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

afterAll(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'test';
process.env.UPLOAD_DIR = path.join(__dirname, 'test-uploads');
process.env.FRONTEND_URL = 'http://localhost:5173';

if (!fs.existsSync(process.env.UPLOAD_DIR)) {
  fs.mkdirSync(process.env.UPLOAD_DIR, { recursive: true });
}