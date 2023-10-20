const encBase64 = require("crypto-js/enc-base64");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userRoutes = require("./routes/sign_up");
// const userTest = require("./routes/test");
const offerRoutes = require("./routes/offer");

app.use(userRoutes);
app.use(offerRoutes);
// app.use(userTest);

app.all("*", (req, res) => {
  res.status(404).json("this route is not exsist");
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
