const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();

const { checkToken } = require("./middlewares/auth");

const users = require("./routes/user");

const MongoURI = `mongodb+srv://${process.env.USER}:${process.env.PASS}@agro-allies.g23amjr.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(MongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on("error", (err) => {
  console.error(err);
});

db.on("open", () => {
  console.log("DB Connection Established");
});

const app = express();

// app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(checkToken);
app.use("/users", users);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
