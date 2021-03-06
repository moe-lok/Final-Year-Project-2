const express = require("express");
const cors = require('cors')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
const entriesRouter = require("./routes/api/entries")
const confMachRouter = require("./routes/api/confmachine")
const bonRouter = require("./routes/api/bonderEntries")
const bonLinkRouter = require("./routes/api/bonderLinkEntries")
const path = require("path")
require("dotenv").config()

const app = express();
app.use(cors())
app.use(express.json());
// DB Config
const db = require("./config/keys").mongoURI || process.env.MONGODB_URI;
// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);
app.use("/api/entries", entriesRouter)
app.use("/api/confmach", confMachRouter)
app.use("/api/bon", bonRouter)
app.use("/api/bonlink", bonLinkRouter)

app.use(express.static(path.join(__dirname,"client", "build")))

app.get("*", (req, res) =>{
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} ...!`));