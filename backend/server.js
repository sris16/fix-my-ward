const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const citizenRoutes = require("./routes/citizenRoutes");
const issueRoutes = require("./routes/issueRoutes");

const app = express();

// connect database
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/citizens", citizenRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (req, res) => {
    res.send("Fix My Ward Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});