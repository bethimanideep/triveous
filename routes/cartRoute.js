const express = require('express');
const mongoose = require('mongoose');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const verifyToken = require('../middlewares/authentication');
const cartRoute = express.Router();

// Product Add-to-cart Route
cartRoute.post('/add-to-cart', verifyToken, async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        //Checking UsersCart
        let cart = await cartModel.findOne({ userId });
        //If Cart NotPresent Create Cart
        if (!cart) {
            //Creating Cart
            let newcart = new cartModel({
                userId,
                products: [],
                totalprice: 0,
            });
            //Pushing products to Products Array
            newcart.products.push({
                productId,
                quantity,
            });

            let product = await productModel.findOne({ _id: productId })
            if (!product) return res.status(404).json({ msg: "product not found in cart route" })
            //Checking Availability
            if (!product.availability) return res.status(404).json({ msg: "Product not Available" })

            //Calculating TotalPrice
            newcart.totalprice = product.mrp * quantity
            await newcart.save();
            return res.status(201).json("first product added")
        }
        //If Cart Present
        //Checking ProductID
        if (!mongoose.Types.ObjectId.isValid(productId))return res.status(400).json({ message: 'Invalid productId' });

        let product = await productModel.findOne({ _id: productId })

        if (!product) return res.status(404).json('product not found')
        if (!product.availability) return res.status(404).json({ msg: "Product not Available" })

        //Populating Data from Products Collection
        let dataPopulated = await cartModel.findOne({ userId }).populate('products.productId');
        //Checking Products Already EXists in Cart
        let arr = cart.products
        let temp = false;
        for (let i = 0; i < arr.length; i++) {
            //If Product Present In Cart
            if (arr[i].productId == productId) {
                //Update Quantity And TotalPrice
                arr[i].quantity = arr[i].quantity + quantity
                cart.totalprice = cart.totalprice + product.mrp * quantity
                await cartModel.findOneAndUpdate({ userId }, cart)
                temp = true;
                break;
            }
        }
        //If Product Not Present In Cart
        if (temp == false) {
            //Adding Product To Carts
            cart.products.push({
                productId,
                quantity
            })
            //Getting TotalPrice
            let totalprice = await gettotalprice(dataPopulated.products)
            //Productdata
            let product = await productModel.findOne({ _id: productId })
            //Calculating TotalPrice
            cart.totalprice = totalprice + product.mrp * quantity
            //Update
            await cartModel.findOneAndUpdate({ userId }, cart)
            let updatedcart = await cartModel.findOne({ userId });
            return res.status(201).send({ msg: "product added to cart", updatedcart })
        } else return res.status(201).send({ msg: "product already present in cart updated quantity and totalprice" })
        
    } catch (error) {
        console.error('Error adding product to cart:', error);
        return res.status(500).json({ error: 'Error in adding product to cart', error });
    }
});

//Getting Carts Data Of Specific User
cartRoute.get('/cartdata/:userId', verifyToken, async (req, res) => {
    try {
        let { userId } = req.params

        let dataPopulated = await cartModel.findOne({ userId }).populate('products.productId');

        res.status(200).json(dataPopulated)

    } catch (error) {
        res.status(500).json(error)
    }
})


//Deleting Product From Cart
cartRoute.delete('/remove/:productId', verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.body;
        //Deleting Product
        let updatedCart = await cartModel.findOneAndUpdate(
            { userId },
            { $pull: { products: { productId } } },
            { new: true }
        );

        let dataPopulated = await cartModel.findOne({ userId }).populate('products.productId');
        //Updating TotalPrice After Deleting
        let totalprice = await gettotalprice(dataPopulated.products)
        await cartModel.findOneAndUpdate({ userId }, {totalprice})
        let data=await cartModel.findOne({ userId })

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while removing the item from the cart' });
    }
});

//Updating Quantity
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

        cart.products = updatedProducts;
        await cart.save();

        cart = await cartModel.findOne({ userId });
        let dataPopulated = await cartModel.findOne({ userId }).populate('products.productId');
        let totalprice = await gettotalprice(dataPopulated.products)
        //Updating Totalprice
        cart.totalprice = totalprice;
        await cart.save();
        // Save the updated cart

        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the quantity', error });
    }
});

//Function For Getting TotalPrice Of CartData
function gettotalprice(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i].quantity * arr[i].productId.mrp
    }
    return sum
}

module.exports = cartRoute;
