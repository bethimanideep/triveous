const productModel = require("../models/productModel");

exports.getAllCategories = async (req, res) => {
    try {
        //Fetching Categories
        const categories = await productModel.distinct('category');
        res.status(200).json(categories);
      } catch (error) {
        console.error('Error retrieving categories:', error);
        res.status(500).json({ error: 'An error occurred while retrieving categories' });
      }
}