//create authentication enpoints that i will export to my main server file
const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require('./Models/User');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;


router.post("/health", (req, res) => {
    res.status(200).json({ message: "ok" });
});

router.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    console.log('username',username);
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create a new user
        const user = new User({ username, password: hashedPassword });
    
        // Save the user to the database
        await user.save();
    
        res.json({ message: 'User registered successfully' });
        
      } catch (err) {
        if (err.code === 11000) {
            // Duplicate username error
            return res.status(400).json({ message: 'Username already exists' });
        }
        else {
            console.error('Error registering user:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
      }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "username not found" });
    }

    // Compare the provided password with the stored password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: "password incorrect" });
    }

    const token = jwt.sign({ username }, secret);
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.use((err, req, res, next) => {
    console.log(err);
    res.status(400).json(err.message);
});

module.exports = router;

