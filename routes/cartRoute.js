const express = require('express');
const mongoose = require('mongoose');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const verifyToken = require('../middlewares/authentication');
const cartRoute = express.Router();

// Create a route to add products to the cart
cartRoute.post('/add-to-cart', verifyToken, async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Find the user's cart or create a new one if it doesn't exist
        let cart = await cartModel.findOne({ userId });
        //cart notpresent
        if (!cart) {
            let newcart = new cartModel({
                userId,
                products: [],
                totalprice: 0,
            });
            newcart.products.push({
                productId,
                quantity,
            });
            let product = await productModel.findOne({ _id: productId })
            if (!product) return res.status(404).json({ msg: "product not found in cart route" })

            if (!product.availability) return res.status(404).json({ msg: "Product not Available" })
            newcart.totalprice = product.mrp * quantity
            await newcart.save();
            return res.status(201).json("first product added")
        }
        //cart present
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid productId' });
        }
        let product = await productModel.findOne({ _id: productId })
        if (!product) return res.status(404).json('product not found')
        if (!product.availability) return res.status(404).json({ msg: "Product not Available" })
        let dataPopulated = await cartModel.findOne({ userId }).populate('products.productId');
        //checking
        let arr = cart.products
        let temp = false;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].productId == productId) {
                //case product present
                arr[i].quantity = arr[i].quantity + quantity
                // let product = await productModel.findOne({ _id: productId })
                cart.totalprice = cart.totalprice + product.mrp * quantity
                await cartModel.findOneAndUpdate({ userId }, cart)
                temp = true;
                break;
            }
        }
        console.log(temp);
        if (temp == false) {
            // not present
            cart.products.push({
                productId,
                quantity
            })
            //total price
            let totalprice = await gettotalprice(dataPopulated.products)
            //productdata
            let product = await productModel.findOne({ _id: productId })
            cart.totalprice = totalprice + product.mrp * quantity
            await cartModel.findOneAndUpdate({ userId }, cart)
            let updatedcart = await cartModel.findOne({ userId });
            return res.status(201).send({ msg: "product added to cart", updatedcart })
        } else {
            return res.status(201).send({ msg: "product already present in cart updated quantity and totalprice" })
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        return res.status(500).json({ error: 'Error in adding product to cart', error });
    }
});
cartRoute.get('/cartdata/:userId', verifyToken, async (req, res) => {
    try {
        let { userId } = req.params
        let dataPopulated = await cartModel.findOne({ userId }).populate('products.productId');

        res.status(200).json(dataPopulated)

    } catch (error) {
        res.status(500).json(error)
    }
})



cartRoute.delete('/remove/:productId', verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.body; // Get the user ID from the request
        // Find the user's cart and remove the product based on the product ID
        let updatedCart = await cartModel.findOneAndUpdate(
            { userId },
            { $pull: { products: { productId } } },
            { new: true }
        );
        let dataPopulated = await cartModel.findOne({ userId }).populate('products.productId');
        let totalprice = await gettotalprice(dataPopulated.products)
        console.log(totalprice);
        await cartModel.findOneAndUpdate({ userId }, {totalprice})
        let data=await cartModel.findOne({ userId })

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while removing the item from the cart' });
    }
});

cartRoute.put('/update-quantity', verifyToken, async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Validate that userId and productId are valid MongoDB ObjectIDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid userId or productId' });
        }

        // Find the user's cart
        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the product and validate its availability
        const product = await productModel.findById(productId);

        if (!product || !product.availability) {
            return res.status(404).json({ message: 'Product not found or not available' });
        }

        // Update the quantity of the specified product in the cart
        const updatedProducts = cart.products.map((cartProduct) => {
            if (cartProduct.productId.equals(productId)) {
                cartProduct.quantity = quantity;
            }
            return cartProduct;
        });

        // Calculate the new totalprice based on the updated quantities


        // Update the cart with the updated products and totalprice
        cart.products = updatedProducts;
        await cart.save();
        cart = await cartModel.findOne({ userId });
        let dataPopulated = await cartModel.findOne({ userId }).populate('products.productId');
        let totalprice = await gettotalprice(dataPopulated.products)
        cart.totalprice = totalprice;
        await cart.save();
        // Save the updated cart

        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the quantity', error });
    }
});


function gettotalprice(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i].quantity * arr[i].productId.mrp
    }
    return sum
}




module.exports = cartRoute;
