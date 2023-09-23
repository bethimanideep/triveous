const express = require('express');
const categoryRoute = express.Router();
const { getAllCategories } = require('../controllers/categoryController');
const verifyToken = require('../middlewares/authentication');

// Create a route to add a product
categoryRoute.get('/getcategories',getAllCategories)

module.exports = categoryRoute;
