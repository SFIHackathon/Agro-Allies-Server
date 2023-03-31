const { User } = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.checkToken = async (req, res, next) => {
  try {
    if (req.headers["x-access-token"]) {
      const accessToken = req.headers["x-access-token"];
      const { _id, email, exp } = await jwt.verify(
        accessToken,
        process.env.DB_SECRET
      );

      res.locals.userData = await User.findById(_id);
      next();
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid Token", error: error });
  }
};

exports.isValidUser = (req, res, next) => {
  const user = res.locals.userData;
  if (!user)
    return res.status(401).json({
      message: "User not found! PLease log in with valid credentials",
    });
  req.user = user;
  next();
};
