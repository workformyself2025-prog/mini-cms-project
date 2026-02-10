// server.js

const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();



dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)

.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));


// 🔹 Schema
const testSchema = new mongoose.Schema({
  name: String,
  age: Number
});
const Test = mongoose.model("Test", testSchema);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const AuthUser = mongoose.model("AuthUser", userSchema);

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model("Blog", blogSchema);



// 🔹 ROUTE (frontend yahan se baat karega)
app.get("/", (req, res) => {
  res.send("Backend + MongoDB working 🚀");
});


// 🔹 Data add karne ka route
app.post("/add", async (req, res) => {
  try {
    const newData = new Test(req.body);
    await newData.save();
    res.send("Data Saved");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new AuthUser({
    email,
    password: hashedPassword
  });

  await newUser.save();
  res.send("Registered Successfully");
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await AuthUser.findOne({ email });

  if (!user) return res.status(401).send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    res.send("Login Success ✅");
  } else {
    res.status(401).send("Wrong Password ❌");
  }
});



app.get("/users", async (req, res) => {
  const users = await Test.find();
  res.json(users);
});

app.delete("/users/:id", async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.send("User Deleted");
  } catch (err) {
    res.status(500).send(err);
  }
});


app.put("/users/:id", async (req, res) => {
  const { name, age } = req.body;
  await Test.findByIdAndUpdate(req.params.id, { name, age });
  res.send("User Updated");
});

app.get("/search/:name", async (req, res) => {
    const name = req.params.name;

    const users = await Test.find({
        name: { $regex: name, $options: "i" }  // case-insensitive search
    });

    res.json(users);
});

// Add blog
app.post("/blogs", async (req, res) => {
  const blog = new Blog(req.body);
  await blog.save();
  res.send("Blog Saved");
});

// Get all blogs
app.get("/blogs", async (req, res) => {
  const blogs = await Blog.find();
  res.json(blogs);
});

// Delete blog
app.delete("/blogs/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});


// 🔹 Server Start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


