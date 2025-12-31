const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

//import student routes
app.use("/api/students", studentRoutes);

app.get('/', (req, res) => {
    res.send("Nokta Academy Backend is Running!");
})

module.exports = app;