const express = require('express');
const cartModel = require('../models/cartModel');
const ordersModel = require('../models/ordersModel');
const verifyToken = require('../middlewares/authentication');
const ordersRoute = express.Router();
// Your Mongoose models and other setup code

// Create a route to place an order
ordersRoute.post('/place-order', verifyToken, async (req, res) => {
  try {
    const userId = req.body.userId; // Assuming you have a user ID in the request body

    // Find the user's cart
    const cart = await cartModel.findOne({ userId }).populate('products.productId');
    if (!cart)return res.status(404).json({ message: 'Cart not found' });
    if(cart.totalprice==0)return res.status(404).json({msg:'cart is empty'})    

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
    await cartModel.findOneAndUpdate({ userId }, { $set: { products: [], totalprice: 0 } });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while placing the order', error });
  }
});

ordersRoute.get('/allorders', verifyToken, async (req, res) => {
  try {
    let { userId } = req.body
    let dataPopulated = await ordersModel.find({ userId })

    res.status(200).json(dataPopulated)

  } catch (error) {
    res.status(500).json({ msg: "error in getting allorders", error })
  }
})
ordersRoute.get('/getorder/:id', verifyToken, async (req, res) => {
  try {
    let id = req.params.id
    let dataPopulated = await ordersModel.findOne({ _id: id })
    res.status(200).json(dataPopulated)

  } catch (error) {
    res.status(500).json({ msg: "error in getting the specific order", error })
  }
})

module.exports = ordersRoute;