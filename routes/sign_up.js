const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const express = require("express");

const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

const User = require("../models/Sign_up");

router.post("/user/signup", async (req, res) => {
  try {
    const email = await User.findOne({ email: req.body.email });
    if (email) {
      res.status(400).json({ message: "this mail is already existed" });
    } else {
      const body = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
      };
      const salt = uid2(16);
      const hash = SHA256(body.password + salt).toString(encBase64);
      const token = uid2(64);
      const newUser = new User({
        account: {
          username: req.body.username,
          avatar: Object, // nous verrons plus tard comment uploader une image
        },
        email: req.body.email,
        newsletter: req.body.newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });

      console.log(newUser);
      await newUser.save();
      res.status(200).json({
        email: newUser.email,
        account: newUser.account,
        _id: newUser._id,
        newsletter: newUser.newsletter,
        token: newUser.token,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/user/login", isAuthenticated, async (req, res) => {
  try {
    const body2 = {
      email: req.body.email,
      password: req.body.password,
    };
    const user = await User.findOne({ email: req.body.email });
    const hash2 = SHA256(body2.password + user.salt).toString(encBase64);
    // console.log(user);
    // console.log(hash2);
    // console.log(user.hash);
    if (hash2 !== user.hash) {
      res.status(400).json({ message: "wrong password" });
    } else {
      res.status(200).json({
        email: user.email,
        account: user.account,
        _id: user._id,
        newsletter: user.newsletter,
        token: user.token,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
