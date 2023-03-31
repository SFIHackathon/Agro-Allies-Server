const express = require("express");
const router = express.Router();
require("dotenv").config();

const User = require("../models/User");
// const { isValidUser } = require("../middlewares/auth");
// const { grantAccess } = require("../middlewares/grantAccess");
const getUserProps = (user) => {
  return {
    _id: user._id,
    email: user.email,
  };
};
router.route("/register").post(async (req, res) => {
  try {
    //check if email taken
    if (await User.emailTaken(req.body.email)) {
      return res.status(400).json({ message: "Sorry email already taken" });
    }
    //generate user instance
    const userObj = {
      ...req.body,
    };

    const user = new User(userObj);

    //save user to db
    const doc = await user.save();

    //generate token
    const token = user.generateToken();

    //send email

    //response
    res.cookie("x-access-token", token).status(200).send(getUserProps(doc));
  } catch (error) {
    res.status(400).json({ message: "Error", error: error });
  }
});

router.route("/login").post(async (req, res) => {
  try {
    //check email
    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({ message: "E-mail not registered" });

    //check password
    const passwordMatch = await user.comparePassword(req.body.password);
    if (!passwordMatch)
      return res.status(400).json({ message: "Wrong Password" });

    //generate token
    const token = user.generateToken();

    //response
    res.cookie("x-access-token", token).status(200).send(getUserProps(user));
  } catch (error) {
    res.status(400).json({ message: "Error", error: error });
  }
});

module.exports = router;
