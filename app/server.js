const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const multer = require("multer");
const port = process.env.PORT || 8888;
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "nodelogin",
});
const app = express();

var upload = multer();

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/css")));
app.use(express.static(path.join(__dirname, "/html")));

app.get("/", function (req, res) {
  // Render login template
  res.sendFile(path.join(__dirname + "/html/login.html"));
});

app.post("/auth", function (req, res) {
  // Capture the input fields
  let username = req.body.username;
  let password = req.body.password;
  // Ensure the input fields exists and are not empty
  if (username && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          // Authenticate the user
          req.session.loggedin = true;
          req.session.username = username;
          // Redirect to home page
          res.redirect("/home");
        } else {
          res.send("Tên đăng nhập hoặc Mật khẩu không đúng!");
          res.end();
        }
      }
    );
  } else {
    res.send("Hãy nhập Tên đăng nhập và Mật khẩu!");
    res.end();
  }
});

app.get("/home", function (req, res) {
  // If the user is loggedin
  if (req.session.loggedin) {
    // Output username
    // res.send("Welcome back, " + req.session.username + "!");
    res.sendFile(path.join(__dirname + "/html/home.html"));
  } else {
    // Not logged in
    res.send("Hãy đăng nhập để xem trang này!");
  }
  // res.end();
});

app.get("/setting", function (req, res) {
  if (req.session.loggedin) {
    sess = req.session;
    if (sess.username != "admin") {
      res.send("Chỉ Admin mới xem được trang này!");
      res.end();
    }
    res.sendFile(path.join(__dirname, "/html/setting.html"));
  } else {
    // Not logged in
    res.send("Hãy đăng nhập để xem trang này!");
  }
});

app.post("/import", upload.single("studentList"), function (req, res, next) {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
});

app.listen(port);
console.log("Server started at http://localhost:" + port);
