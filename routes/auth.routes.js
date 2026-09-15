const User = require('./../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router()
const { verifyToken } = require("./../middlewares/auth.middleware")

router.post('/register', async (req, res, next) => {
    const { password, username } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: "Missing username or password" });
        return;
    }

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({ message: "Password must contain at least one lowercase letter, one uppercase letter, one digit, and be between 8 and 20 characters long" });
        return;
    }

    try {
        const foundUser = await User.findOne({ username });
        if (foundUser) {
            res.status(400).json({ message: "Username already in use" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({ password: hashedPassword, username });
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {

    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: "Missing username or password" });
        return;
    }

    try {
        const foundUser = await User.findOne({ username });

        if (!foundUser) {
            res.status(400).json({ message: 'Invalid credentials' })
            return;
        }

        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        if (!passwordMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const payload = { id: foundUser._id, username: foundUser.username };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });

        res.status(200).json({ message: "Logged in successfully", token, payload, profilImage: foundUser.image });
    } catch (err) {
        next(err);
    }
});

router.get("/verify", verifyToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.payload.id).select('username image').lean();

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json({
            message: "Token is valid",
            payload: req.payload,
            image: user.image,
        });
    } catch (err) {
        next(err);
    }
});


module.exports = router;