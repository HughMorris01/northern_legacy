const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@northernlegacy.com',
    passwordHash: 'fake_hashed_password_123', // We will add real bcrypt hashing later
    role: 'admin',
    isVerified: true
  },
  {
    firstName: 'Boat',
    lastName: 'Captain',
    email: 'driver@northernlegacy.com',
    passwordHash: 'fake_hashed_password_456',
    role: 'driver',
    isVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    passwordHash: 'fake_hashed_password_789',
    role: 'customer'
  }
];

module.exports = users;