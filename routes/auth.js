const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const isAdmin = email.endsWith('@alphaware.com');
        const user = await User.findOne({email:email});
        if(user){
            return res.status(400).json({message: "User Already Exist With this Email"})
        }
        const newUser = new User({ name, email, password, isAdmin });
        await newUser.save();
        return res.status(201).json(newUser);
    } catch (err) {
       return  res.status(500).json({message: "Something Went Wrong"});
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json("User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json("Invalid credentials");

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const userData = {
            id:user._id,
            name : user.name,
            email : user.email,
            appliedJobs: user.appliedJobs,
            isAdmin : user.isAdmin
        }
       return  res.status(200).json({ token , user:userData});
    } catch (err) {
       return  res.status(500).json(err);
    }
});

module.exports = router;
