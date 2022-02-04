const express = require("express");
const path = require("path");
const addUser = require("./database.js");

const app = express();
const PORT = 8000;
const staticPath = path.join(__dirname, "../public");


app.use(express.static(staticPath));

app.use(express.json());

app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.sendFile(staticPath + "/index.html");
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post("/leaderboard", (req, res) => {
  var _username = req.body.username;
  var _score = req.body.score;
  addUser(_username, _score);
  sleep(2000).then(() => {
      res.sendFile(staticPath + '/scores.txt');
  })
});

app.listen(PORT, (req, res) => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
