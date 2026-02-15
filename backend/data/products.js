const products = [
  {
    name: 'Northern Lights - 1/8th Jar',
    brand: 'Excelsior Genetics',
    category: 'Flower',
    strainType: 'Indica',
    description: 'Premium indoor-grown flower cultivated in Upstate NY.',
    price: 4000, // $40.00 in cents
    image: '/images/northern-lights.jpg',
    stockQuantity: 50,
    metrcPackageUid: '1A40E0100000000000000001',
    thcContent: 22.5,
    testingStatus: 'TestPassed',
    weightInOunces: 0.125
  },
  {
    name: 'Sour Diesel - 1g Pre-Roll',
    brand: 'Excelsior Genetics',
    category: 'Pre-Roll',
    strainType: 'Sativa',
    description: 'Perfectly packed pre-roll for on-the-go.',
    price: 1500, // $15.00 in cents
    image: '/images/sour-diesel-preroll.jpg',
    stockQuantity: 100,
    metrcPackageUid: '1A40E0100000000000000002',
    thcContent: 19.0,
    testingStatus: 'TestPassed',
    weightInOunces: 0.035
  }
];

module.exports = products;