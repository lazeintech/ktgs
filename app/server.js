const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const XLSX = require("xlsx");

const multer = require("multer");
const { exit } = require("process");
const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Chỉ chấp nhận file excel.", false);
  }
};
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/uploads/studentLists/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage, fileFilter: excelFilter });

const port = process.env.PORT || 8888;
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "nodelogin",
});

var app = express();

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
    const error = new Error("Hãy chọn file.");
    error.httpStatusCode = 400;
    return next(error);
  }
  var workbook = XLSX.readFile(file.destination + file.filename);
  var sheet_name_list = workbook.SheetNames;
  var xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]]);

  // Reading line by line
  const allLines = xlData.split(/\r\n|\n/);
  let className = "";
  allLines.forEach((line) => {
    allCells = line.split(",");
    // skip empty line
    if (allCells[0] == "" && allCells[1] == "") return;

    // parsing class, semester
    allCells.forEach((cell) => {
      // if (cell.includes("Học phần:")) {
      //   tmp = cell.split(":");
      //   console.log("Học phần: " + tmp[1].replace('"', "").replace(/\s/g, ""));
      //   return;
      // }
      if (cell.includes("khoá:")) {
        tmp = cell.split(":");
        className = tmp[1].replace('"', "").replace(/\s/g, "");
        console.log("Lớp-khoá: " + className);
        //INSERT INTO `nodelogin`.`classes` (`name`) VALUES ('TEST-CLASS1');
        connection.query(
          "INSERT INTO `nodelogin`.`classes` (`name`) VALUES (?)",
          [className],
          function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) {
              if (error.code === "ER_DUP_ENTRY") {
                console.log("Lớp đã tồn tại trong DB.");
                return;
              } else throw error;
            }
            // If success
            if (results.length > 0) {
              console.log("Đã thêm lớp " + className + " vào DB.");
            } else {
              console.log("Không thể thêm danh sách lớp!");
            }
          }
        );
        return;
      }
    });

    // parsing students
    if (isNumeric(allCells[0])) {
      // console.log(line);
      tmp = line.split(",");
      stdCode = tmp[2];
      stdLMName = tmp[3];
      stdFName = tmp[4];
      connection.query(
        "INSERT INTO `nodelogin`.`students` (`className`, `stdCode`, `stdFName`, `stdLMName`) VALUES (?, ?, ?, ?)",
        [className, stdCode, stdFName, stdLMName],
        function (error, results, fields) {
          // If there is an issue with the query, output the error
          if (error) {
            if (error.code === "ER_DUP_ENTRY") {
              console.log("SV đã tồn tại trong DB.");
              return;
            } else throw error;
          }
          // If success
          if (results.length > 0) {
            console.log(
              "Đã thêm SV " + stdLMName + " " + stdFName + " vào DB."
            );
          } else {
            console.log("Không thể thêm sinh viên!");
          }
        }
      );
      return;
    }
  });
  res.redirect("/setting");
});

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

app.listen(port);
console.log("Server started at http://localhost:" + port);
