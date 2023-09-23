const productModel = require("../models/productModel");
const mongoose=require('mongoose')

//Getting Products Based On Category
exports.getProductsByCategory = async (req, res) => {
  try {
    const {category} = req.params
    const products = await productModel.find({ category });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'getProductsByCategory',error });
  }
};

//
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.product_id;
        //Checking ProductId
        if (!mongoose.Types.ObjectId.isValid(productId))return res.status(400).json({ message: 'Invalid productId' });

        let product = await productModel.findOne({ _id: productId })

        //Checking Product
        if (!product)return res.status(404).json({ message: 'Product not found' });

        res.status(200).json(product);
      } catch (error) {
        res.status(500).json({ message: 'getProductById Error',error });
      }
  };
