const products = [
  // --- FLOWER ---
  {
    name: 'Alien Rock Candy',
    brand: 'Excelsior Genetics',
    category: 'Flower',
    image: '/assets/flower/alien_rock_candy.jpg',
    description: 'Our flagship in-house indica. Sweet, fruity, and deeply relaxing. Perfect for late-night river sessions.',
    price: 4500, 
    stockQuantity: 45, // Healthy Stock
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000001',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 24.5
  },
  {
    name: 'Creepy Killer',
    brand: 'Ayrloom',
    category: 'Flower',
    image: '/assets/flower/creepy_killer.jpg',
    description: 'A heavy-hitting upstate classic from the Ayrloom family farms in Lafayette. A pungent, earthy aroma with a soaring cerebral high.',
    price: 5000,
    stockQuantity: 0, // OUT OF STOCK
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000002',
    metrcLabStatus: 'TestPassed',
    strainType: 'Sativa',
    thcContent: 26.2
  },
  {
    name: 'Diesel Dough',
    brand: 'Hudson Cannabis',
    category: 'Flower',
    image: '/assets/flower/diesel_dough.jpg',
    description: 'Sun-grown in the Hudson Valley. This hybrid crosses Sour Diesel with Do-Si-Dos for a perfect afternoon balance.',
    price: 4000,
    stockQuantity: 3, // ALMOST GONE
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000003',
    metrcLabStatus: 'TestPassed',
    strainType: 'Hybrid',
    thcContent: 22.8
  },
  {
    name: 'Dirt Nap',
    brand: 'MFNY',
    category: 'Flower',
    image: '/assets/flower/dirt_nap.jpg',
    description: 'Crafted by Made For New York. As the name implies, clear your schedule. A deeply sedating indica.',
    price: 5500,
    stockQuantity: 28,
    weightInOunces: 0.125,
    isLimitedRelease: true, 
    metrcPackageUid: '1A40E010000000000000004',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 29.1
  },
  {
    name: 'Dosidos #4',
    brand: 'Excelsior Genetics',
    category: 'Flower',
    image: '/assets/flower/dosidos_4.jpg',
    description: 'In-house pheno hunt winner. Frosty, purple hues with a classic cookie dough and gas profile.',
    price: 4500,
    stockQuantity: 0, // OUT OF STOCK
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000005',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 25.0
  },
  {
    name: 'Dubba Dosi',
    brand: 'High Peaks',
    category: 'Flower',
    image: '/assets/flower/dubba_dosi.jpg',
    description: 'Luxury indoor flower from High Peaks. A double-dose of relaxation with incredibly dense bud structure.',
    price: 6000,
    stockQuantity: 4, // ALMOST GONE
    weightInOunces: 0.125,
    isLimitedRelease: true, 
    metrcPackageUid: '1A40E010000000000000006',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 31.2
  },
  {
    name: 'Ice Cream Cone',
    brand: 'Florist Farms',
    category: 'Flower',
    image: '/assets/flower/ice_cream_cone.jpg',
    description: 'Regenerative, sun-grown flower from Cortland. Sweet, creamy smoke with an uplifting, euphoric sativa high.',
    price: 3500,
    stockQuantity: 80,
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000008',
    metrcLabStatus: 'TestPassed',
    strainType: 'Sativa',
    thcContent: 21.0
  },
  {
    name: 'Junior Mintz',
    brand: 'Excelsior Genetics',
    category: 'Flower',
    image: '/assets/flower/junior_mintz.jpg',
    description: 'Minty, chocolatey, and grown right here. A perfectly balanced hybrid for any time of day on the 1000 Islands.',
    price: 4500,
    stockQuantity: 2, // ALMOST GONE
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000009',
    metrcLabStatus: 'TestPassed',
    strainType: 'Hybrid',
    thcContent: 23.4
  },
  {
    name: 'Moon Boots',
    brand: 'Flowerhouse',
    category: 'Flower',
    image: '/assets/flower/moon_boots.jpg',
    description: 'Premium indoor exotic from the Hudson Valley. Covered in trichomes that look like lunar dust.',
    price: 5500,
    stockQuantity: 10,
    weightInOunces: 0.125,
    isLimitedRelease: true, 
    metrcPackageUid: '1A40E010000000000000010',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 28.7
  },
  {
    name: 'Polynesian Thin Mints',
    brand: 'Ayrloom',
    category: 'Flower',
    image: '/assets/flower/polynesian_thin_mints.jpg',
    description: 'Tropical fruit meets cool mint. A fantastic daytime hybrid that keeps you focused and relaxed.',
    price: 4500,
    stockQuantity: 0, // OUT OF STOCK
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000011',
    metrcLabStatus: 'TestPassed',
    strainType: 'Hybrid',
    thcContent: 24.1
  },
  {
    name: 'Scooby Snacks',
    brand: 'Hudson Cannabis',
    category: 'Flower',
    image: '/assets/flower/scooby_snacks.jpg',
    description: 'A classic organic munchie-inducer. Earthy pine flavors that settle you right into the couch.',
    price: 4000,
    stockQuantity: 18,
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000012',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 20.5
  },
  {
    name: 'Sugar Biscuits',
    brand: 'MFNY',
    category: 'Flower',
    image: '/assets/flower/sugar_biscuits.jpg',
    description: 'Single-source excellence. Doughy, sweet, and coated in sticky resin. Highly recommended.',
    price: 5000,
    stockQuantity: 5, // ALMOST GONE
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000013',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 27.3
  },
  {
    name: 'Valley Vixen',
    brand: 'Nanticoke',
    category: 'Flower',
    image: '/assets/flower/valley_vixen.jpg',
    description: 'A sharp, citrus-forward sativa. Ideal for a morning boat ride or an active hike.',
    price: 4200,
    stockQuantity: 22,
    weightInOunces: 0.125,
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000014',
    metrcLabStatus: 'TestPassed',
    strainType: 'Sativa',
    thcContent: 23.0
  },
  {
    name: 'Yellow Snow',
    brand: 'High Peaks',
    category: 'Flower',
    image: '/assets/flower/yellow_snow.jpg',
    description: 'Don\'t let the name fool you. A zesty, lemon-heavy sativa that delivers a massive burst of creative energy.',
    price: 5000,
    stockQuantity: 14,
    weightInOunces: 0.125,
    isLimitedRelease: true, 
    metrcPackageUid: '1A40E010000000000000015',
    metrcLabStatus: 'TestPassed',
    strainType: 'Sativa',
    thcContent: 26.8
  },

  // --- CONCENTRATES ---
  {
    name: 'Hash Blast',
    brand: 'Nanticoke',
    category: 'Concentrate',
    image: '/assets/concentrates/hash_blast.jpg',
    description: 'Extracted in Endicott, NY. A full-spectrum solventless concentrate bursting with old-school hash flavor.',
    price: 7000,
    stockQuantity: 15,
    weightInOunces: 0.035, 
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000007',
    metrcLabStatus: 'TestPassed',
    strainType: 'Hybrid',
    thcContent: 74.5
  },
  {
    name: 'Super Lemon Live Badder',
    brand: 'Hudson Cannabis',
    category: 'Concentrate',
    image: '/assets/concentrates/hudson_live_badder.jpg',
    description: 'Whipped to a perfect golden consistency. Extremely terpy and bright.',
    price: 6500,
    stockQuantity: 2, // ALMOST GONE
    weightInOunces: 0.035, 
    isLimitedRelease: true,
    metrcPackageUid: '1A40E010000000000000016',
    metrcLabStatus: 'TestPassed',
    strainType: 'Sativa',
    thcContent: 78.2
  },
  {
    name: 'Excelsior Premium Rosin',
    brand: 'Excelsior Genetics',
    category: 'Concentrate',
    image: '/assets/concentrates/excelsior_rosin.jpg',
    description: 'Our solventless, cold-cured rosin. Pressed from our finest indoor harvest.',
    price: 8000,
    stockQuantity: 0, // OUT OF STOCK
    weightInOunces: 0.035, 
    isLimitedRelease: true,
    metrcPackageUid: '1A40E010000000000000017',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 81.0
  },

  // --- VAPES ---
  {
    name: 'Gazzurple Live Rosin Cart (1g)',
    brand: 'MFNY',
    category: 'Vape',
    image: '/assets/vapes/mfny_gazzurple_cart.jpg',
    description: 'Premium 510 thread cartridge. 100% pure live rosin with no distillate added.',
    price: 6500,
    stockQuantity: 4, // ALMOST GONE
    weightInOunces: 0.035, 
    isLimitedRelease: true,
    metrcPackageUid: '1A40E010000000000000018',
    metrcLabStatus: 'TestPassed',
    strainType: 'Sativa',
    thcContent: 85.5
  },
  {
    name: 'Orchard Sleep Pen (.5g)',
    brand: 'Ayrloom',
    category: 'Vape',
    image: '/assets/vapes/ayrloom_sleep_pen.jpg',
    description: 'An all-in-one disposable vape formulated with CBN to guarantee a full night of rest.',
    price: 4500,
    stockQuantity: 0, // OUT OF STOCK
    weightInOunces: 0.017, 
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000019',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 75.0
  },
  {
    name: 'Sour Diesel Disposable (1g)',
    brand: 'Nanticoke',
    category: 'Vape',
    image: '/assets/vapes/nanticoke_sour_diesel.jpg',
    description: 'Rechargeable, draw-activated disposable hitting with classic gas flavors.',
    price: 5500,
    stockQuantity: 30, // Healthy Stock
    weightInOunces: 0.035, 
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000020',
    metrcLabStatus: 'TestPassed',
    strainType: 'Sativa',
    thcContent: 88.1
  },

  // --- EDIBLES ---
  {
    name: 'Watermelon Gummies (100mg)',
    brand: 'Off Hours',
    category: 'Edible',
    image: '/assets/edibles/off_hours_watermelon.jpg',
    description: 'Fast-acting nano-gummies. 10mg THC per piece, perfect for relaxing on the dock.',
    price: 2500,
    stockQuantity: 5, // ALMOST GONE
    weightInOunces: 0, // Edibles use item count, not flower weight limit
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000021',
    metrcLabStatus: 'TestPassed',
    strainType: 'Hybrid',
    thcContent: 10.0
  },
  {
    name: 'Sleepy Chocolate Bar (100mg)',
    brand: 'Florist Farms',
    category: 'Edible',
    image: '/assets/edibles/florist_farms_chocolate.jpg',
    description: 'Rich dark chocolate infused with THC and Melatonin. Break into 10 squares.',
    price: 2800,
    stockQuantity: 50, 
    weightInOunces: 0, 
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000022',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 10.0
  },
  {
    name: 'Honeycrisp Apple Beverage',
    brand: 'Ayrloom',
    category: 'Edible',
    image: '/assets/edibles/ayrloom_apple_beverage.jpg',
    description: 'Crisp, refreshing, and locally sourced. 5mg THC and 5mg CBD per can.',
    price: 800,
    stockQuantity: 0, // OUT OF STOCK
    weightInOunces: 0, 
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000023',
    metrcLabStatus: 'TestPassed',
    strainType: 'Hybrid',
    thcContent: 5.0
  },

  // --- PRE-ROLLS ---
  {
    name: 'Excelsior 1g Pre-Roll',
    brand: 'Excelsior Genetics',
    category: 'Pre-Roll',
    image: '/assets/prerolls/excelsior_1g_preroll.jpg',
    description: 'Convenient and perfectly packed with our premium indoor flower.',
    price: 1500,
    stockQuantity: 120, // Healthy Stock
    weightInOunces: 0.035, 
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000024',
    metrcLabStatus: 'TestPassed',
    strainType: 'Indica',
    thcContent: 24.5
  },
  {
    name: 'Dogwalkers Mini Pre-Rolls (5-Pack)',
    brand: 'Dogwalkers',
    category: 'Pre-Roll',
    image: '/assets/prerolls/dogwalkers_minis.jpg',
    description: 'Five 0.35g joints in a durable tin. Perfect for sharing or a quick solo walk.',
    price: 3500,
    stockQuantity: 2, // ALMOST GONE
    weightInOunces: 0.061, 
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000025',
    metrcLabStatus: 'TestPassed',
    strainType: 'Hybrid',
    thcContent: 22.0
  },

  // --- TINCTURES ---
  {
    name: 'Head & Heal 1:1 THC/CBD',
    brand: 'Head & Heal',
    category: 'Tincture',
    image: '/assets/tinctures/head_heal_1_1.jpg',
    description: 'Sublingual drops for rapid onset. A perfectly balanced ratio to ease the mind and body.',
    price: 6000,
    stockQuantity: 15, 
    weightInOunces: 0, 
    isLimitedRelease: false,
    metrcPackageUid: '1A40E010000000000000026',
    metrcLabStatus: 'TestPassed',
    strainType: 'Hybrid',
    thcContent: 50.0 // Usually mg per bottle, leaving as percentage format for your UI
  },

  // --- ACCESSORIES ---
  {
    name: 'Ooze Standard 510 Battery',
    brand: 'Ooze',
    category: 'Accessory',
    image: '/assets/accessories/ooze_510_battery.jpg',
    description: 'Reliable, variable voltage 510 thread battery. USB charger included.',
    price: 2000,
    stockQuantity: 25, 
    weightInOunces: 0, 
    isLimitedRelease: false,
    metrcPackageUid: 'NA-BATTERY-001',
    metrcLabStatus: 'N/A',
    strainType: '',
    thcContent: 0
  },
  {
    name: 'RAW Classic King Size Papers',
    brand: 'RAW',
    category: 'Accessory',
    image: '/assets/accessories/raw_king_size.jpg',
    description: 'Unbleached, natural rolling papers with tips included.',
    price: 500,
    stockQuantity: 0, // OUT OF STOCK
    weightInOunces: 0, 
    isLimitedRelease: false,
    metrcPackageUid: 'NA-PAPERS-001',
    metrcLabStatus: 'N/A',
    strainType: '',
    thcContent: 0
  }
];

module.exports = products;