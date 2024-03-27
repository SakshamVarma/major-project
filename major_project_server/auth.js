//create authentication enpoints that i will export to my main server file
const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require('./Models/User');
const jwt = require('jsonwebtoken');

router.post("/health", (req, res) => {
    res.status(200).json({ message: "ok" });
});

router.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
    }

    if (users[username]) {
        return res.status(400).json({ error: "username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = hashedPassword;
    res.status(201).json({ message: "success" });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
    }

    if (!users[username]) {
        return res.status(401).json({ error: "username not found" });
    }

    const passwordValid = await bcrypt.compare(password, users[username]);
    if (!passwordValid) {
        return res.status(401).json({ error: "password incorrect" });
    }

    const token = jwt.sign({ username }, secret);
    res.status(200).json({ token });
});


router.use((err, req, res, next) => {
    console.log(err);
    res.status(400).json(err.message);
});

module.exports = router;

