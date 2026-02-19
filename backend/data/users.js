const bcrypt = require('bcryptjs');

const users = [
  {
    firstName: 'Admin',
    lastName: 'NorthernLegacy',
    email: 'admin@northernlegacy.com',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'admin',
    isVerified: true,
    idDocumentHash: 'ADMIN-HASH-001'
  },
  {
    firstName: 'Greg',
    lastName: 'Customer',
    email: 'greg@aol.com',
    passwordHash: bcrypt.hashSync('123', 10),
    role: 'customer',
    isVerified: true,
    idDocumentHash: 'GREG-HASH-001'
  },
  {
    firstName: 'Jason',
    lastName: 'Stowell',
    email: 'jay@aol.com',
    passwordHash: bcrypt.hashSync('123', 10),
    role: 'customer',
    isVerified: true,
    idDocumentHash: 'MIKE-HASH-001'
  },
  {
    firstName: 'Tom',
    lastName: 'Customer',
    email: 'tom@aol.com',
    passwordHash: bcrypt.hashSync('123', 10),
    role: 'customer',
    isVerified: true,
    idDocumentHash: 'TOM-HASH-001'
  },
  {
    firstName: 'Meg',
    lastName: 'Converse',
    email: 'meg@aol.com',
    passwordHash: bcrypt.hashSync('123', 10),
    role: 'customer',
    isVerified: true,
    idDocumentHash: 'LEE-HASH-001'
  }
];

module.exports = users;