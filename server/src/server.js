const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const menu = require("./data/menu");

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Pizza server is running"
  });
});

app.get("/api/menu", (req, res) => {
    res.status(200).json(menu);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});