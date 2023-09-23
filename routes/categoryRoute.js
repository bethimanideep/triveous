const express = require('express');
const categoryRoute = express.Router();
const { getAllCategories } = require('../controllers/categoryController');
const verifyToken = require('../middlewares/authentication');

//Route For Getting Categories
categoryRoute.get('/getcategories',getAllCategories)

module.exports = categoryRoute;
