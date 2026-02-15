const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc    Fetch all Northern Legacy products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    // .find({}) tells MongoDB to return everything in the collection
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    res.status(500).json({ message: 'Server Error fetching inventory' });
  }
});

// @desc    Fetch a single product by its MongoDB ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error fetching product: ${error.message}`);
    res.status(500).json({ message: 'Server Error fetching product details' });
  }
});

module.exports = router;