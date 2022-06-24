const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const db = require("./connection/db");

const app = express();
const port = 5000;

app.set("view engine", "hbs"); //setup template engine

app.use("/public", express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "rahasia", // <= isi bebas
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // sesi bertahan selama 2 jam, setelah itu expired dan harus login ulang
    },
  })
);

app.use(flash());

//test koneksi ke databse
db.connect(function (err, _, done) {
  if (err) throw err;
  console.log("Database Connection Succes");
});

// GET //
app.get("/", function (req, res) {
  // console.log(req.session);
  db.connect(function (err, client, done) {
    if (err) throw err; //nampilkan error koneksi di db

    client.query("SELECT * FROM tb_projects", function (err, result) {
      if (err) throw err;
      // console.log(result.rows);
      let data = result.rows;

      let dataProjects = data.map(function (item) {
        return {
          ...item,
          lengthDate: getDateDifference(
            //mendapatkan hasil durasi tanggal
            new Date(item.start_date),
            new Date(item.end_date)
          ),
          posting: getDistanceTime(item.post_at),
          isLogin: req.session.isLogin,
        };
      });

      res.render("index", {
        isLogin: req.session.isLogin,
        user: req.session.user,
        dataProjects: dataProjects,
      });
    });
    done();
  });
});

app.get("/project", function (req, res) {
  if (!req.session.user) {
    req.flash("danger", "Login dulu woy...!!!");
    return res.redirect("/login");
  }
  res.render("myproject", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
});

app.get("/project-detail/:id", function (req, res) {
  let id = req.params.id; //mengambil parameter id
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `SELECT * FROM tb_projects WHERE id=${id};`, //medapatkan data pada id tertentu
      function (err, result) {
        if (err) throw err;
        // console.log(result.rows[0]);
        let data = result.rows[0];

        data.startDate = getFullTime(data.start_date); //konversi tanggal
        data.endDate = getFullTime(data.end_date);
        (data.lengthDate = getDateDifference(
          //mendapatkan hasil durasi
          new Date(data.start_date),
          new Date(data.end_date)
        )),
          (data.isLogin = req.session.isLogin),
          (data.user = req.session.user),
          res.render("project-detail", data);
      }
    );
  });
});

app.get("/edit-project/:id", function (req, res) {
  if (!req.session.user) {
    req.flash("danger", "Login dulu woy...!!!");
    return res.redirect("/login");
  }
  let id = req.params.id;
  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_projects WHERE id=${id};`;

    client.query(query, function (err, result) {
      if (err) throw err;
      // console.log(result.rows[0]);
      const edit = result.rows[0]; //data ditampung dalam variable edit
      edit.start_date = changeTime(edit.start_date); // konversi tanggal supaya bisa tampil di halaman edit
      edit.end_date = changeTime(edit.end_date); //sama kaya yang diatas cuma inimah tanggal akhir

      res.render("edit-project", {
        isLogin: req.session.isLogin,
        user: req.session.user,
        edit,
        id: id,
      });
    });
  });
});

app.get("/delete-project/:id", function (req, res) {
  if (!req.session.user) {
    req.flash("danger", "Login dulu woy...!!!");
    return res.redirect("/login");
  }
  const id = req.params.id; //mengambil data parameter

  db.connect(function (err, client, done) {
    if (err) throw err;
    const query = `DELETE FROM tb_projects WHERE id=${id};`; //query menghapus data berdasar
    client.query(query, function (err, result) {
      if (err) throw err;
      res.redirect("/");
    });
    done();
  });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/logout", function (req, res) {
  req.session.destroy(); //sesion akan dihapus

  res.redirect("/login");
});

// POST //
app.post("/project", function (req, res) {
  //methode submit data
  const data = req.body;
  const technologies = [];

  if (req.body.nodejs) {
    technologies.push("nodejs");
  } else {
    technologies.push("");
  }
  if (req.body.reactjs) {
    technologies.push("reactjs");
  } else {
    technologies.push("");
  }
  if (req.body.nextjs) {
    technologies.push("nextjs");
  } else {
    technologies.push("");
  }
  if (req.body.typescript) {
    technologies.push("typescript");
  } else {
    technologies.push("");
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `INSERT INTO tb_projects(name, start_date, end_date, description, technologies, image)
    VALUES ( '${data.inputProjectName}', '${data.inputStartDate}', '${data.inputEndDate}', '${data.inputDescription}',ARRAY['${technologies[0]}','${technologies[1]}','${technologies[2]}','${technologies[3]}'], '${data.uploadImage}');`;

    client.query(query, function (err, result) {
      if (err) throw err;

      res.redirect("/");
    });
    done();
  });
});

app.post("/edit-project/:id", function (req, res) {
  const data = req.body; // mengambil data
  const technologies = []; // menampung array

  if (req.body.nodejs) {
    //pengkondisian array techologies jikalau checked maka push ke database
    technologies.push("nodejs");
  } else {
    technologies.push("");
  }
  if (req.body.reactjs) {
    technologies.push("reactjs");
  } else {
    technologies.push("");
  }
  if (req.body.nextjs) {
    technologies.push("nextjs");
  } else {
    technologies.push("");
  }
  if (req.body.typescript) {
    technologies.push("typescript");
  } else {
    technologies.push("");
  }

  db.connect(function (err, client, done) {
    let id = req.params.id; //meminta parameter
    if (err) throw err; // kalo error ada keterangannya

    const query = `UPDATE tb_projects SET name= '${data.inputProjectName}', start_date='${data.inputStartDate}', end_date='${data.inputEndDate}', description='${data.inputDescription}', technologies=ARRAY['${technologies[0]}','${technologies[1]}','${technologies[2]}','${technologies[3]}'], image='${data.uploadImage}' 
    WHERE id=${id};`; //query buat update data

    client.query(query, function (err, result) {
      if (err) throw err; // kalo error disini berarti kendalanya di query-nya
      res.redirect("/"); //ngedirect ke homepage
    });
    done(); // biar ga loading lama
  });
});

app.post("/register", function (req, res) {
  //method post supaya bisa memasukan ke -nya
  // console.log(req.body);
  const name = req.body.inputName;
  const email = req.body.inputEmail;
  let password = req.body.inputPassword; //menampung variable inputpassword

  password = bcrypt.hashSync(password, 10); // enkripsi password (10 saltRound = 10 hash/ second)

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_user WHERE email = '${email}'`; //check email exist in DB

    client.query(query, function (err, result) {
      if (err) throw err;

      const data = result.rows;
      // console.log(data);
      if (data.length > 0) {
        req.flash("danger", " Email already exist..!");
        return res.redirect("/register");
      } else {
        db.connect(function (err, client, done) {
          if (err) throw err;

          const query = `INSERT INTO tb_user(name,email,password)
          VALUES ('${name}','${email}','${password}')`;

          client.query(query, function (err, result) {
            if (err) throw err;

            res.redirect("/login");
          });
        });
      }
    });
  });
});

app.post("/login", function (req, res) {
  const email = req.body.inputEmail;
  const password = req.body.inputPassword;

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_user WHERE email = '${email}'`; //check email exist in DB

    client.query(query, function (err, result) {
      if (err) throw err;

      const data = result.rows;

      if (data.length == 0) {
        //pengecekan apabila email belum terdaftar
        req.flash("danger", " Email not Found..!, Register Please..");
        return res.redirect("/login");
      }
      const isMatch = bcrypt.compareSync(password, data[0].password); //pencocokan password antara input password dengan hasil pencarian db
      // console.log(isMatch);
      if (isMatch == false) {
        req.flash("danger", "Upss...!!??, Password not Match..!");
        return res.redirect("/login");
      }
      //memasukkan data ke session
      req.session.isLogin = true;
      req.session.user = {
        //mengetahui siapa yang sedang login
        id: data[0].id,
        email: data[0].email,
        name: data[0].name,
      };
      req.flash("success", "Login succes");
      res.redirect("/");
    });
    done();
  });
});

//FUNCTION----------
function getDateDifference(startDate, endDate) {
  //Durasi tanggal
  if (startDate > endDate) {
    console.error("Start date must be before end date");
    return null;
  }
  let startYear = startDate.getFullYear();
  let startMonth = startDate.getMonth();
  let startDay = startDate.getDate();
  let endYear = endDate.getFullYear();
  let endMonth = endDate.getMonth();
  let endDay = endDate.getDate();

  let february =
    (endYear % 4 == 0 && endYear % 100 != 0) || endYear % 400 == 0 ? 29 : 28;

  let daysOfMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let startDateNotPassedInEndYear =
    endMonth < startMonth || (endMonth == startMonth && endDay < startDay);

  let years = endYear - startYear - (startDateNotPassedInEndYear ? 1 : 0);

  let months = (12 + endMonth - startMonth - (endDay < startDay ? 1 : 0)) % 12;

  let days =
    startDay <= endDay
      ? endDay - startDay
      : daysOfMonth[(12 + endMonth - 1) % 12] - startDay + endDay;

  return { years: years, months: months, days: days };
}

function getFullTime(waktu) {
  //konversi tanggal
  let month = [
    "Januari",
    "Febuari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  let date = waktu.getDate();
  let monthIndex = waktu.getMonth();
  let year = waktu.getFullYear();
  let hours = waktu.getHours();
  let minutes = waktu.getMinutes();

  let fullTime = `${date} ${month[monthIndex]} ${year}`;
  return fullTime;
}

function getDistanceTime(waktu) {
  //memunculkan postingnya kapan
  let timeNow = new Date();
  let timePost = waktu;
  let distance = timeNow - timePost; // hasilnya milisecond
  // console.log(distance);

  let milisecond = 1000; // 1 detik 1000 milisecond
  let secondInHours = 3600; // 1 jam sama dengan 3600 detik
  let hoursInDay = 24; // 1 hari 24 jam

  let distanceDay = Math.floor(
    distance / (milisecond * secondInHours * hoursInDay)
  );
  let distanceHours = Math.floor(distance / (milisecond * 60 * 60));
  let distanceMinutes = Math.floor(distance / (milisecond * 60));
  let distanceSeconds = Math.floor(distance / milisecond);

  if (distanceDay > 0) {
    return `${distanceDay} day ago`;
  } else if (distanceHours > 0) {
    return `${distanceHours} hours ago`;
  } else if (distanceMinutes > 0) {
    return `${distanceMinutes} minutes ago`;
  } else {
    return `${distanceSeconds} seconds ago`;
  }
}

function changeTime(waktu) {
  //memunculkan start date dan end date di form edit/update
  let newTime = new Date(waktu);
  const date = newTime.getDate();
  const monthIndex = newTime.getMonth() + 1;
  const year = newTime.getFullYear();

  if (monthIndex < 10) {
    monthformat = "0" + monthIndex;
  } else {
    monthformat = monthIndex;
  }

  if (date < 10) {
    dateformat = "0" + date;
  } else {
    dateformat = date;
  }

  const fullTime = `${year}-${monthformat}-${dateformat}`;

  return fullTime;
}

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
