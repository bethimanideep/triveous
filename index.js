const express = require('express')
const connection = require('./config/db')
const rateLimit = require('express-rate-limit');

const userRoute = require('./routes/userRoute')
const productRoute = require('./routes/productRoute')
const cartRoute = require('./routes/cartRoute')
const categoryRoute = require('./routes/categoryRoute')
const ordersRoute = require('./routes/ordersRoute')

require('dotenv').config()
const app = express()
app.use(express.json())

// Define a rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Maximum 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});

// Apply rate limiting to specific routes
app.use('/product', limiter);
app.use('/cart', limiter);
app.use('/orders', limiter);
app.use('/category', limiter);

app.use('/user', userRoute)
app.use('/product', productRoute)
app.use('/cart', cartRoute)
app.use('/orders', ordersRoute)
app.use('/category', categoryRoute)


app.get('/', (req, res) => {
    res.json('welcome')
})

app.listen(process.env.port, async () => {
    try {
        await connection
        console.log('connected to db');
        console.log(`server is running at ${process.env.port}`);
    } catch (error) {
        console.log(error);
    }
})