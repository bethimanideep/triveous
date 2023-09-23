const express = require('express');
const productRoute = express.Router();
const productModel = require('../models/productModel');
const verifyToken = require('../middlewares/authentication');
const { getProductsByCategory, getProductById } = require('../controllers/productController');
const { authorize } = require('../middlewares/authorization');

//Add a product Role=[Admin] Only
productRoute.post('/add-product', verifyToken, authorize(['Admin']), async (req, res) => {
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
    return res.status(500).json({ error: 'Error in Product Adding', error });
  }
});


//Products listing based on category Name
productRoute.get('/categoryproducts/:category', getProductsByCategory);

//Fetching Product By ProductID
productRoute.get('/getproduct/:product_id', getProductById)

module.exports = productRoute;
