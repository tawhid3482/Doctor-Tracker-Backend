process.env.PORT ??= '4000';
process.env.DATABASE_URL ??= 'mongodb://127.0.0.1:27017/doctor_tracker_test';
process.env.CLIENT_ORIGIN ??= 'http://localhost:3000';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-with-more-than-32-characters';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-with-more-than-32-characters';
process.env.ADMIN_EMAIL ??= 'test@example.com';
process.env.ADMIN_PASSWORD ??= 'test-password-long-enough';
