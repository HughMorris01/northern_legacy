const bcrypt = require('bcryptjs');

const users = [
  {
    firstName: 'Admin',
    lastName: 'NorthernLegacy',
    email: 'admin@northernlegacy.com',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'admin',
    isVerified: true,
    idDocumentHash: 'ADMIN-HASH-001',
    address: {
      street: '123 River Rd',
      city: 'Alexandria Bay',
      postalCode: '13607',
      terrainType: 'Land',
      lat: 44.3361,
      lng: -75.9184
    }
  },
  {
    firstName: 'Greg',
    lastName: 'Customer',
    email: 'greg@aol.com',
    passwordHash: bcrypt.hashSync('123', 10),
    role: 'customer',
    isVerified: true,
    idDocumentHash: 'GREG-HASH-001',
    address: {
      street: '456 Riverside Dr',
      city: 'Clayton',
      postalCode: '13624',
      terrainType: 'Land',
      lat: 44.2395,
      lng: -76.0858
    }
  },
  {
    firstName: 'Jason',
    lastName: 'Stowell',
    email: 'jay@aol.com',
    passwordHash: bcrypt.hashSync('123', 10),
    role: 'customer',
    isVerified: true,
    idDocumentHash: 'MIKE-HASH-001',
    address: {
      street: '789 Bay St',
      city: 'Cape Vincent',
      postalCode: '13618',
      terrainType: 'Land',
      lat: 44.1287,
      lng: -76.3332
    }
  },
  {
    firstName: 'Tom',
    lastName: 'Customer',
    email: 'tom@aol.com',
    passwordHash: bcrypt.hashSync('123', 10),
    role: 'customer',
    isVerified: true,
    idDocumentHash: 'TOM-HASH-001',
    address: {
      street: '101 Farm View Ln',
      city: 'Theresa',
      postalCode: '13691',
      terrainType: 'Land',
      lat: 44.2184,
      lng: -75.7972
    }
  },
  {
    firstName: 'Meg',
    lastName: 'Converse',
    email: 'meg@aol.com',
    passwordHash: bcrypt.hashSync('123', 10),
    role: 'customer',
    isVerified: true,
    idDocumentHash: 'LEE-HASH-001',
    address: {
      street: '202 Lakeway Dr',
      city: 'Redwood',
      postalCode: '13679',
      terrainType: 'Land',
      lat: 44.2981,
      lng: -75.8016
    }
  },
  // --- REAL WORLD DATA MERGE ---
  {
    firstName: 'Sean',
    lastName: 'Boyle',
    email: 'seanboyly6570@gmail.com',
    passwordHash: '$2b$10$0A2S3.eAO9ezJ5HzxBfeju/oVjSeNApBNeJhwwYaLLL0g26ih8VSi',
    role: 'customer',
    isVerified: true,
    idExpirationDate: '2028-02-19',
    verificationRefNumber: 'inq_FtK7koawoFhHNNf7x7Yk5SvEJGbG',
    address: {
      street: '333 St Lawrence Ave',
      city: 'Clayton',
      postalCode: '13624',
      terrainType: 'Land',
      lat: 44.2400,
      lng: -76.0800
    }
  },
  {
    firstName: 'Megan',
    lastName: 'Boyle',
    email: 'mgould0731@yahoo.com',
    passwordHash: '$2b$10$IPdzibzavcgVGL85OF9kwe8VkEJuUoiB5.3ylXQjAvkLckm2e6zie',
    role: 'customer',
    isVerified: false,
    address: {
      street: '444 High St',
      city: 'Alexandria Bay',
      postalCode: '13607',
      terrainType: 'Land',
      lat: 44.3300,
      lng: -75.9100
    }
  },
  {
    firstName: 'Haiti',
    lastName: 'Jason',
    email: 'haiti@aol.com',
    passwordHash: '$2b$10$GMabMEwd83ZYriNQ.fKxWeqpNPexxJigBb2LPqzsz7Iup3fjY6d8q',
    role: 'customer',
    isVerified: false,
    address: {
      terrainType: 'Land'
    }
  }
];

module.exports = users;