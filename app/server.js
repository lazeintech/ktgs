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
app.use(express.static(path.join(__dirname, "/img")));
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
        Bạn chưa đăng nhập. <br/>
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
        Bạn chưa đăng nhập. <br/>
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
      let classCode = "";
      let semesterCode = "";
      let skipClassAndSemester = false;
      allLines.forEach((line) => {
        allCells = line.split(",");
        // skip empty line
        if (allCells[0] == "" && allCells[1] == "") return;

        // parsing class, semester
        allCells.forEach((cell) => {
          if (!semesterCode && cell.includes("Học phần:")) {
            tmp = cell.split(":");
            semesterCode = tmp[1].replace('"', "").replace(/\s/g, "");
            console.log("Học phần: " + semesterCode);
            return;
          }
          if (!classCode && cell.includes("khoá:")) {
            tmp = cell.split(":");
            classCode = tmp[1].replace('"', "").replace(/\s/g, "");
            console.log("Lớp-khoá: " + classCode);
            return;
          }
        });

        if (!skipClassAndSemester && classCode && semesterCode) {
          skipClassAndSemester = true;
          connection.query(
            "INSERT INTO `nodelogin`.`classes` (`classCode`) VALUES (?)",
            [classCode],
            function (error, results, fields) {
              // If there is an issue with the query, output the error
              if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                  console.log("Lớp đã tồn tại trong DB.");
                } else {
                  res.statusCode = 400;
                  res.end(error);
                }
              }
              // If success
              console.log("Đã thêm lớp " + classCode + " vào DB.");
            }
          );
          connection.query(
            "INSERT INTO `nodelogin`.`semesters` (`classCode`, `semesterCode`) VALUES (?, ?)",
            [classCode, semesterCode],
            function (error, results, fields) {
              // If there is an issue with the query, output the error
              if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                  console.log("Học phần đã tồn tại trong DB.");
                } else {
                  res.statusCode = 400;
                  res.end(error);
                }
              }
              // If success
              console.log("Đã thêm học phần " + semesterCode + " vào DB.");
            }
          );
        }

        // parsing students
        if (isNumeric(allCells[0])) {
          // console.log(line);
          tmp = line.split(",");
          stdCode = tmp[2];
          stdLMName = tmp[3];
          stdFName = tmp[4];
          connection.query(
            "INSERT INTO `nodelogin`.`students` \
              (`classCode`, `stdCode`, `stdFName`, `stdLMName`) \
              VALUES(?, ?, ?, ?)",
            [classCode, stdCode, stdFName, stdLMName],
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
      res.statusCode = 200;
      res.send(results);
    }
  );
});

// get_semesters
app.post("/api/get_semesters", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("%s: %j", req.path, data);
  connection.query(
    "SELECT * FROM `nodelogin`.`semesters` WHERE classCode = ?",
    [data.classCode],
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) {
        console.log(error);
        throw error;
      }
      // If success
      res.statusCode = 200;
      res.send(results);
    }
  );
});

// get_students
app.post("/api/get_students", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("%s: %j", req.path, data);
  connection.query(
    "SELECT * FROM `nodelogin`.`students` WHERE classCode = ?",
    [data.classCode],
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) {
        console.log(error);
        throw error;
      }
      // If success
      res.statusCode = 200;
      res.send(results);
    }
  );
});

// get_accounts
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
  console.log("%s: %j", req.path, data);
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

// get_violation_detail
app.post("/api/get_violation_detail", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("%s: %j", req.path, data);
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

// add_violation_detail
app.post("/api/add_violation_detail", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("%s: %j", req.path, data);
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

// get_violation_records
app.post("/api/get_violation_records", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("%s: %j", req.path, data);
  connection.query(
    "SELECT violation_detail.detail \
      FROM nodelogin.violation_detail \
      INNER JOIN nodelogin.violation_records \
      ON violation_records.detailid = violation_detail.detailid \
      WHERE ( \
        violation_records.classCode = ? \
        AND violation_records.semesterCode = ? \
        AND violation_records.job = ? \
        )",
    [data.classCode, data.semesterCode, data.job],
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) {
        console.log(error);
        throw error;
      }
      // If success
      res.statusCode = 200;
      res.send(results);
    }
  );
});

// add_violation_records
app.post("/api/add_violation_records", function (req, res) {
  if (!req.session.loggedin) {
    res.statusCode = 400;
    res.end("Login first!");
    return;
  }
  const data = req.body;
  console.log("%s: %j", req.path, data);
  detail = JSON.parse(data.detailArr);
  if (!detail.length) {
    res.statusCode = 400;
    res.end("Chưa có dữ liệu vi phạm");
    return;
  }

  let query =
    "INSERT INTO `nodelogin`.`violation_records` (`classCode`, `semesterCode`, `stdCode`, `job`, `detailId`, `createdBy`, `createdDate`) VALUES ";
  for (i = 0; i < data.count; ++i) {
    query += `('${data.classCode}', '${data.semesterCode}', '${data.stdCode}', '${data.job}', '${detail[i].detailId}', '${req.session.username}', '${data.date}')`;
    if (i + 1 == data.count) query += "";
    else query += ",";
  }
  console.log(query);
  connection.query(query, function (error, results, fields) {
    // If there is an issue with the query, output the error
    if (error) {
      console.log(error);
      throw error;
    }
    // If success
    console.log(results);
  });
  res.statusCode = 200;
  res.end();
});
