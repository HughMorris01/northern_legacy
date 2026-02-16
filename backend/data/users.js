const bcrypt = require('bcryptjs');

// We use bcrypt.hashSync to instantly scramble a simple password ('123456') 
// so we can use it for all our test accounts without typing the hash manually.
const defaultPassword = bcrypt.hashSync('123456', 10);

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@northernlegacy.com',
    passwordHash: defaultPassword,
    role: 'admin',
    isVerified: true
  },
  {
    firstName: 'Boat',
    lastName: 'Captain',
    email: 'driver@northernlegacy.com',
    passwordHash: defaultPassword,
    role: 'driver',
    isVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    passwordHash: defaultPassword,
    role: 'customer'
  }
];

module.exports = users;