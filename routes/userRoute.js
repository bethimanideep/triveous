const express = require('express')
const userRoute = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { userModel } = require('../models/usermodel')
require('dotenv').config()


userRoute.post('/register', async (req, res) => {
    try {
        let { name, email, password } = req.body
        if (!name || !email || !password) res.json('Improper Registration Fields');
        else {
            let user = await userModel.findOne({ email })
            if (user) {
                res.json('Already User Exists')
            } else {
                let hash = bcrypt.hashSync(password, 10)
                let data = {
                    name,
                    email,
                    password: hash
                }
                let userdata = new userModel(data)
                await userdata.save()
                res.json('User Registered Successfully')
            }
        }
    } catch (error) {
        console.log(error);
    }
})
userRoute.post('/login', async (req, res) => {
    try {
        let { email, password} = req.body
        if (!email || !password) res.json('Improper Login Fields.');
        else {
            let user = await userModel.findOne({ email })
            if (!user) res.json('User Not Found')
            else {
                let passwordcheck = bcrypt.compareSync(password, user.password)
                if (!passwordcheck) res.json("Invalid Password")
                else {
                    let token = jwt.sign({ user }, process.env.secret, { expiresIn: '1h' })
                    let refreshtoken = jwt.sign({ user }, process.env.secret, { expiresIn: '2h' })
                    res.json({
                        msg: 'User LoggedIn Successfully',
                        token,
                        refreshtoken
                    })
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
})


module.exports = userRoute