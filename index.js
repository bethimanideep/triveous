const express=require('express')
const connection = require('./config/db')
const userRoute = require('./routes/userRoute')
require('dotenv').config()
const app=express()
app.use(express.json())
app.use('/user',userRoute)
app.get('/',(req,res)=>{
    res.json('welcome')
})

app.listen(process.env.port,async()=>{
    try {
        await connection
        console.log('connected to db');
        console.log(`server is running at ${process.env.port}`);
    } catch (error) {
        console.log(error);
    }
})