const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const XLSX = require("xlsx");
const multer = require("multer");

const port = process.env.PORT || 8888;
var app = express();
app.use(
  cors({
    origin: ["http://localhost:" + port, "http://127.0.0.1:" + port],
    credentials: true,
  })
);
app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "http://localhost:" + port + "/api/get_classes"
  );
  res.header("Access-Control-Allow-Headers", true);
  res.header("Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  next();
});
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/css")));
app.use(express.static(path.join(__dirname, "/html")));
app.listen(port);

// CONFIGURATIONs
console.log("Server started at http://localhost:" + port);

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "nodelogin",
});

///////////////////////////////////////////////////////////////////////////////
// SERVINGs
///////////////////////////////////////////////////////////////////////////////
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
    res.statusCode = 400;
    res.end(`
    <html>
      <head>
        <meta charset="utf-8">
      </head>
        <body>
        Hãy đăng nhập. <br/>
        <form action="/">
            <input type="submit" value="OK" />
        </form>
      </body>
    </html>`);
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
    res.statusCode = 400;
    res.end(`
    <html>
      <head>
        <meta charset="utf-8">
      </head>
        <body>
        Hãy đăng nhập. <br/>
        <form action="/">
            <input type="submit" value="OK" />
        </form>
      </body>
    </html>`);
  }
});

///////////////////////////////////////////////////////////////////////////////
// APIs
///////////////////////////////////////////////////////////////////////////////
// add_user
app.post("/api/add_user", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const user = req.body;
  if (!user.username || !user.password) {
    res.statusCode = 400;
    res.end(`
    <html>
      <head>
        <meta charset="utf-8">
      </head>
        <body>
        Hãy nhập tên đăng nhập và mật khẩu. <br/>
        <form action="/setting">
            <input type="submit" value="OK" />
        </form>
      </body>
    </html>`);
  }
  connection.query(
    "INSERT INTO `nodelogin`.`accounts` (`username`, `password`) VALUES (?, ?)",
    [user.username, user.password],
    function (error, results, fields) {
      console.log("adding user");
      // If there is an issue with the query, output the error
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(error);
          res.statusCode = 400;
          res.end(`
          <html>
            <head>
              <meta charset="utf-8">
            </head>
              <body>
                Tài khoản đã tồn tại, vui lòng chọn lại Tên đăng nhập. <br/>
              <form action="/setting">
                  <input type="submit" value="OK" />
              </form>
            </body>
          </html>`);
          return;
        } else {
          console.log(error);
          throw error;
        }
      }
      // If success
      if (results.affectedRows > 0) {
        res.statusCode = 200;
        res.end(`
          <html>
            <head>
              <meta charset="utf-8">
            </head>
              <body>
                Tạo tài khoản thành công. <br/>
              <form action="/setting">
                  <input type="submit" value="OK" />
              </form>
            </body>
          </html>`);
      } else {
        res.statusCode = 500;
        res.end(results);
      }
    }
  );
});

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
function isNumeric(value) {
  return /^-?\d+$/.test(value);
}
// import_classes
app.post(
  "/api/import_classes",
  upload.single("studentList"),
  function (req, res, next) {
    if (!req.session.loggedin) {
      res.statusCode = 400;
      res.end("Login first!");
      return;
    }
    const file = req.file;
    if (!file) {
      // const error = new Error("Hãy chọn file.");
      // error.httpStatusCode = 400;
      // return next(error);
      res.statusCode = 400;
      res.end(`
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body>
              Hãy chọn file. <br/>
              <form action="/setting">
                <input type="hidden" name="tab" value="tabid2"/>
                <input type="submit" value="OK"/>
              </form>
          </body>
        </html>`);
      return next();
    } else {
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
            connection.query(
              "INSERT INTO `nodelogin`.`classes` (`name`) VALUES (?)",
              [className],
              function (error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) {
                  if (error.code === "ER_DUP_ENTRY") {
                    console.log("Lớp đã tồn tại trong DB.");
                    return;
                  } else {
                    res.statusCode = 400;
                    res.end(error);
                  }
                }
                // If success
                if (results.affectedRows > 0) {
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
          // TODO: try catch
          connection.query(
            "INSERT INTO `nodelogin`.`students` \
              (`className`, `stdCode`, `stdFName`, `stdLMName`) \
              VALUES(?, ?, ?, ?)",
            [className, stdCode, stdFName, stdLMName],
            function (error, results, fields) {
              // If there is an issue with the query, output the error
              if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                  // console.log("SV đã tồn tại trong DB.");
                  return;
                } else throw error;
              }
              // If success
              if (results.affectedRows > 0) {
                console.log(
                  "Đã thêm SV " + stdLMName + " " + stdFName + " vào DB."
                );
              } else {
                res.statusCode = 500;
                res.end(results);
              }
            }
          );
          return;
        }
      });
    }
    res.statusCode = 200;
    res.end(`
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        Thêm lớp thành công. <br/>
        <form action="/setting">
          <input type="hidden" name="tab" value="tabid2" />
          <input type="submit" value="OK"/>
        </form>
      </body>
    </html>`);
  }
);

// get_classes
app.post("/api/get_classes", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  connection.query(
    "SELECT * FROM `nodelogin`.`classes`",
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) {
        console.log(error);
        throw error;
      }
      // If success
      console.log(results);
      res.statusCode = 200;
      res.send(results);
    }
  );
});

// get_classes
app.post("/api/get_accounts", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  connection.query(
    "SELECT * FROM `nodelogin`.`accounts` WHERE username != 'admin'",
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) {
        console.log(error);
        throw error;
      }
      // If success
      console.log(results);
      res.statusCode = 200;
      res.send(results);
    }
  );
});

// assign_job
app.post("/api/assign_job", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("body: %j", data);
  connection.query(
    "INSERT INTO `nodelogin`.`job_assignments` (`classCode`, `job1`, `job2`, `job3`, `job4`, `job5`, `job6`) VALUES(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE job6 = ?",
    [
      data.classCode,
      data.job1,
      data.job2,
      data.job3,
      data.job4,
      data.job5,
      data.job6,
      data.job6,
    ],
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) {
        console.log(error);
        throw error;
      }
      // If success
      console.log(results);
    }
  );
  res.statusCode = 200;
  res.end(`
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        Phân công thành công. <br/>
        <form action="/setting">
          <input type="hidden" name="tab" value="tabid3"/>
          <input type="submit" value="OK"/>
        </form>
      </body>
    </html>`);
});

// get_violations
app.post("/api/get_violations", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("body: %j", data);
  connection.query(
    "SELECT * FROM `nodelogin`.`violation_detail` WHERE job = ?",
    [data.job],
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) {
        console.log(error);
        throw error;
      }
      // If success
      console.log(results);
      res.statusCode = 200;
      res.send(results);
    }
  );
});

// add_violation
app.post("/api/add_violation", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("body: %j", data);
  connection.query(
    "INSERT INTO `nodelogin`.`violation_detail` (`job`, `detail`) VALUES(?, ?)",
    [data.job, data.detail],
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) {
        console.log(error);
        throw error;
      }
      // If success
      console.log(results);
    }
  );
  res.statusCode = 200;
  res.end(`
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        Thêm thành công. <br/>
        <form action="/setting">
          <input type="hidden" name="tab" value="tabid4"/>
          <input type="submit" value="OK"/>
        </form>
      </body>
    </html>`);
});
