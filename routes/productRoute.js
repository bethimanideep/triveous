const express = require('express');
const productRoute = express.Router();
const productModel = require('../models/productModel');
const verifyToken = require('../middlewares/authentication');
const { getProductsByCategory, getProductById } = require('../controllers/productController');

// Create a route to add a product
productRoute.post('/add-product', async (req, res) => {
  try {
    // Extract product data from the request body
    const {
      _id,
      brand,
      mrp,
      name,
      image,
      description,
      discount,
      country,
      packsize,
      stock,
      availability,
      category,
    } = req.body;

    // Create a new Product document
    const newProduct = new productModel({
      _id,
      brand,
      mrp,
      name,
      image,
      description,
      discount,
      country,
      packsize,
      stock,
      availability,
      category,
    });

    // Save the product to the database
    await newProduct.save();

    return res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Endpoint for product listing based on category ID
productRoute.get('/categoryproducts/:category', verifyToken,getProductsByCategory);

productRoute.get('/getproduct/:product_id',verifyToken,getProductById)

module.exports = productRoute;