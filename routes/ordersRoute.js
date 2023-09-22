const express = require('express');
const cartModel = require('../models/cartModel');
const ordersModel = require('../models/ordersModel');
const ordersRoute = express.Router();
// Your Mongoose models and other setup code

// Create a route to place an order
ordersRoute.post('/place-order', async (req, res) => {
  try {
    const userId = req.body.userId; // Assuming you have a user ID in the request body

    // Find the user's cart
    const cart = await cartModel.findOne({ userId }).populate('products.productId');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Create an order from the cart data
    const order = new ordersModel({
      userId,
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      totalAmount: cart.totalprice, // Use the totalprice from the cart
    });

    // Save the order to the database
    await order.save();

    // Clear the user's cart (assuming you have a method for this)
    await cartModel.findOneAndUpdate({ userId }, { $set: { products: [] ,totalprice:0} });

    res.json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
});
module.exports = ordersRoute;