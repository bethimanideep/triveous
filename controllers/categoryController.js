const productModel = require("../models/productModel");

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await productModel.distinct('category');
        res.json(categories);
      } catch (error) {
        console.error('Error retrieving categories:', error);
        res.status(500).json({ error: 'An error occurred while retrieving categories' });
      }
}