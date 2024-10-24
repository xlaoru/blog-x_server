const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const blogRoutes = require("./routes/blog.js");
const authRoutes = require("./routes/auth.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.end("Blog-X server is working");
});

app.use("/api", blogRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error.message);
  const status = error.statusCode || 500;
  res.status(status).json({ message: error.message });
});

mongoose
  .connect(
    "mongodb+srv://sia212007:HeD83CELNDtgkfY6@cluster1.4qtdzlb.mongodb.net/Node-API?retryWrites=true&w=majority&appName=Cluster1"
  )
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(() => {
    console.log("Connection failed");
  });
