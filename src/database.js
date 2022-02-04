const sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./scores.db");
const { Console } = require("console");
const fs = require("fs");

var _isExist = false;

const addUser = (_username, _score) => {
  // db.run(`CREATE TABLE users (username TEXT, score INT)`);
  var myLogger = new Console({
    stdout: fs.createWriteStream("./public/scores.txt"),
  });
  db.get(
    `SELECT username FROM users WHERE username = "${_username}"`,
    (err, row) => {
      if (err) {
        return myLogger.log(err.message);
      }
      if (row !== undefined) {
        _isExist = !_isExist;
        return myLogger.log(`Username Already Taken`);
      } else {
        var stmt = db.prepare(`INSERT INTO users VALUES(?, ?)`);
        stmt.run(_username, _score);
        stmt.finalize();
        var i=0;
        db.each(
          `SELECT username, score FROM users ORDER BY score DESC`,
          (err, row) => {
            if (err) {
              return myLogger.log(err.message);
            }
            i = i+1;
            return myLogger.log(`${i}: Username: ${row.username}, Score: ${row.score}`);
          }
  
        );
      }
    }
  );
};

module.exports = addUser;