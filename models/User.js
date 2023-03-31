const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    farmName: {
      type: String,
    },
    location: {
      type: String,
    },
  },
  { timestamps: true }
);

//hashing password for db save
userSchema.pre("save", async function (next) {
  let user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
  }
  next();
});

userSchema.pre("updateOne", async function (next) {
  const password = this.getUpdate().$set.password;
  if (!password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    this.getUpdate().$set.password = hash;
    next();
  } catch (error) {
    return next(error);
  }
});

//token for successful login
userSchema.methods.generateToken = function () {
  let user = this;
  const userObj = { _id: user._id.toHexString(), email: user.email };
  const token = jwt.sign(userObj, process.env.DB_SECRET, { expiresIn: "1d" });
  return token;
};

//token for forgot password
userSchema.methods.generateTokenForgotPassword = function () {
  let user = this;
  const userObj = { _id: user._id.toHexString(), email: user.email };
  const token = jwt.sign(userObj, process.env.DB_SECRET, {
    expiresIn: "15min",
  });
  return token;
};

//compare password from db
userSchema.methods.comparePassword = async function (clientPassword) {
  let user = this;
  let match = await bcrypt.compare(clientPassword, user.password);
  return match;
};

//avoid redundancy
userSchema.statics.emailTaken = async function (email) {
  const user = await this.findOne({ email });
  return user;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
