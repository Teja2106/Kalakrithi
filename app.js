import express from "express";
import path from "path";
import bodyParser from "body-parser";
import pkg from "pg";
import { spawn } from "child_process";

global.__dirname = path.resolve();

const app = express();
const PORT = 3000;

const { Pool } = pkg;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "kalakrithi",
  password: "shoyouwu",
  port: 5432,
});

app.use(express.static(path.join(__dirname, "/public")));
app.set("views engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

function getCurrentDay() {
  const now = new Date();
  const eventStartDate = new Date("2024-03-15");
  const eventEndDate = new Date("2024-03-16");

  if (now >= eventStartDate && now <= eventEndDate) {
    const diffTime = Math.abs(now - eventStartDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } else {
    return -1;
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/scanner-login", (req, res) => {
  res.render("login.ejs", { error: "" });
});

app.post("/scanner-login", (req, res) => {
  let hardCodedEmail = "culturalnight@kk.2k24";
  let hardCodedPassword = "Fest2k24CN";
  let email = req.body.email;
  let password = req.body.password;

  if (email === hardCodedEmail && password === hardCodedPassword) {
    res.redirect("/scanner");
  } else {
    res.render("login.ejs", { error: "Invalid Credentials" });
  }
});

app.get("/scanner", (req, res) => {
  res.render("scanner.ejs", { error: "" });
});

app.post("/scanner", async (req, res) => {
  let hash_mail = req.body.hash_mail;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE hash_mail = $1", [hash_mail]);
    if (rows.length > 0) {
      res.redirect(`/profile?hash_mail=${hash_mail}`);
    } else {
      res.render("scanner.ejs", { error: "User not found." });
    }
  } catch (err) {
    console.error("Error processing hash_mail.", err);
    res.render("scanner.ejs", {
      error: "An error occured. Please try again later.",
    });
  }
});

app.get("/re-mail", (req, res) => {
  res.render("re-mail.ejs", { error: "", success: "" });
});

app.post("/re-mail", async (req, res) => {
  try {
    let email = req.body.email;
    let name = req.body.name;
    let dataToSend;
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows > 0) {
      const python = spawn("python3", [
        "py_mailer/main2.py",
        "--name",
        `${name}`,
        "--email",
        `${email}`,
      ]);
      python.stdout.on("data", function (data) {
        dataToSend = data.toString();
      });
      python.on("close", (code) => {
        console.log(`Child process close all stdio with code ${code}`);
        console.log(dataToSend);
      });
      res.render("re-mail.ejs", { success: "Mail has been sent." });
    } else {
      res.render("re-mail.ejs", {
        error: "You have not registered for the event.",
      });
    }
  } catch (err) {
    console.error("Some error occured: ", err);
    res.redirect("/re-mail");
  }
});

app.get("/profile", async (req, res) => {
  try {
    let hash_mail = req.query.hash_mail;
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE hash_mail = $1", [hash_mail]);
    client.release();

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.render("profile.ejs", { user, error: "", success: "" });
    } else {
      res.render("profile.ejs", { error: "No such user exists in the database.", user });
    }
  } catch (err) {
    console.error("Error executing query.", err);
    res.send('An error occured');
  }
});

app.post("/check-in", async (req, res) => {
  const currentDay = getCurrentDay();
  const { hash_mail } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(`SELECT day${currentDay}_checkin FROM users WHERE hash_mail = $1`, [hash_mail]);
    const user = result.rows[0];
    if (result.rows[0][`day${currentDay}_checkin`]) {
      client.release();
      return res.render("profile.ejs", { error: "You have already checked in for today.", user });
    } else {
      await client.query(`UPDATE users SET day${currentDay}_checkin = NOW() WHERE hash_mail = $1`, [hash_mail]);
      client.release();
      return res.render("profile.ejs", { success: "Check-in successful!", user, error: "" });
    }
  } catch (err) {
    console.error("Error checking in: ", err);
    return res.render("profile.ejs", { error: "Failed to check-in. Please try again later.", user });
  }
});

app.get("/admin", (req, res) => {
  res.render("admin.ejs", { error: "" });
});

app.post("/admin", (req, res) => {
  let adminUsername = "admin";
  let adminPassword = "Shoyo@UwU";
  let username = req.body.username;
  let password = req.body.password;

  if (username === adminUsername && password === adminPassword) {
    res.redirect("/admin-panel");
  } else {
    res.render("admin.ejs", { error: "Invalid Credentials." });
  }
});

app.get("/admin-panel", async (req, res) => {
  try {
    const currentDay = getCurrentDay();

    const day1Result = await pool.query(
      `SELECT COUNT(*) FROM users WHERE day1_checkin IS NOT NULL`
    );
    const day1Count = parseInt(day1Result.rows[0].count);

    const day2Result = await pool.query(
      `SELECT COUNT(*) FROM users WHERE day2_checkin IS NOT NULL`
    );
    const day2Count = parseInt(day2Result.rows[0].count);

    const recipientsResult = await pool.query("SELECT * FROM users");
    const recipients = recipientsResult.rows;

    res.render("admin-panel.ejs", {
      currentDay,
      day1Count,
      day2Count,
      recipients,
      error: null,
    });
  } catch (err) {
    console.error("Error executing query: ", err);
    res.render("admin-panel.ejs", {
      currentDay: null,
      day1Count: null,
      day2Count: null,
      recipients: null,
      error: "An error occured. Please try again later.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});