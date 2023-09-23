const express = require('express')
const userRoute = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { userModel } = require('../models/usermodel')
require('dotenv').config()


userRoute.post('/register', async (req, res) => {
    try {
        let { name, email, password ,role} = req.body
        if (!name || !email || !password) res.json('Improper Registration Fields');
        else {
            let user = await userModel.findOne({ email })
            if (user) return res.json('Already User Exists')
            let hash = bcrypt.hashSync(password, 10)
            let data = {
                name,
                email,
                password: hash,
                role
            }
            let userdata = new userModel(data)
            await userdata.save()
            res.status(201).json('User Registered Successfully')
        }
    } catch (error) {
        res.status(500).json({ msg: "error in register", error })
    }
})
userRoute.post('/login', async (req, res) => {
    try {
        let { email, password} = req.body
        if (!email || !password) return res.status(400).json('Improper Login Fields.');
        let user = await userModel.findOne({ email })
        if (!user) return res.status(404).json('User Not Found')
        let passwordcheck = bcrypt.compareSync(password, user.password)
        if (!passwordcheck) return res.status(401).json("Invalid Password")
        let token = jwt.sign({ user }, process.env.secret, { expiresIn: '1h' })
        let refreshtoken = jwt.sign({ user }, process.env.secret, { expiresIn: '2h' })
        req.user=user

        return res.status(201).json({
            msg: 'User LoggedIn Successfully',
            token,
            refreshtoken
        })
    } catch (error) {
        res.status(500).json({ msg: "error in login", error })
    }
})
userRoute.post('/refresh-token', (req, res) => {
    const refreshToken = req.body.refreshToken; // Assuming the refresh token is sent in the request body

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is missing' });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // If the refresh token is valid, generate a new access token
        // Assuming you encoded the user ID in the refresh token

        const accessToken = jwt.sign({ decoded }, process.env.secret, { expiresIn: '1h' }); // Generate a new access token

        // Send the new access token back to the client
        res.status(201).json({ accessToken });
    });
});



module.exports = userRoute