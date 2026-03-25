const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const persistence = require("./persistence");

const app = express();

persistence.connect();

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// ---------------- AUTH MIDDLEWARE ----------------
async function authMiddleware(req, res, next) {
  let key = req.cookies.session;

  if (!key) return res.redirect("/login");

  let session = await persistence.getSession(key);

  if (!session) return res.redirect("/login");

  if (new Date(session.expiry) < new Date()) {
    await persistence.deleteSession(key);
    return res.redirect("/login");
  }

  // extend session
  let newExpiry = new Date(Date.now() + 1000 * 60 * 5);
  await persistence.updateSessionExpiry(key, newExpiry);

  next();
}

// ---------------- LOG MIDDLEWARE ----------------
async function logMiddleware(req, res, next) {
  let key = req.cookies.session;
  let username = "unknown";

  if (key) {
    let session = await persistence.getSession(key);
    if (session) {
      username = session.data.username;
    }
  }

  await persistence.addLog({
    timestamp: new Date(),
    username: username,
    url: req.originalUrl,
    method: req.method
  });

  next();
}

// ---------------- LOGIN ----------------
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  let user = await persistence.getUser(req.body.username);

  if (!user) return res.redirect("/login");

  let hashed = crypto.createHash("sha256")
    .update(req.body.password)
    .digest("hex");

  if (hashed !== user.password) return res.redirect("/login");

  let key = crypto.randomUUID();

  await persistence.startSession({
    key,
    expiry: new Date(Date.now() + 1000 * 60 * 5),
    data: { username: user.user }
  });

  res.cookie("session", key, { maxAge: 1000 * 60 * 5 });
  res.redirect("/");
});

// ---------------- LOGOUT ----------------
app.get("/logout", async (req, res) => {
  let key = req.cookies.session;
  if (key) await persistence.deleteSession(key);

  res.clearCookie("session");
  res.redirect("/login");
});

// ---------------- PROTECTED ROUTES ----------------
app.get("/", authMiddleware, logMiddleware, async (req, res) => {
  let employees = await persistence.getAllEmployees();
  res.render("landing", { employees });
});

app.get("/employee/:id", authMiddleware, logMiddleware, async (req, res) => {
  let employee = await persistence.getEmployeeById(req.params.id);
  let shifts = await persistence.getShiftsForEmployee(req.params.id);
  res.render("employeeDetails", { employee, shifts });
});

app.get("/addEmployee", authMiddleware, logMiddleware, (req, res) => {
  res.render("addEmployee");
});

app.post("/addEmployee", authMiddleware, logMiddleware, async (req, res) => {
  await persistence.addEmployee(req.body.name, req.body.phone);
  res.redirect("/");
});

app.get("/editEmployee/:id", authMiddleware, logMiddleware, async (req, res) => {
  let employee = await persistence.getEmployeeById(req.params.id);
  res.render("editEmployee", { employee });
});

app.post("/editEmployee/:id", authMiddleware, logMiddleware, async (req, res) => {
  await persistence.updateEmployee(
    req.params.id,
    req.body.name,
    req.body.phone
  );
  res.redirect("/");
});

app.get("/shifts", authMiddleware, logMiddleware, async (req, res) => {
  let shifts = await persistence.getAllShifts();
  let employees = await persistence.getAllEmployees();
  res.render("shifts", { shifts, employees });
});

app.get("/addShift", authMiddleware, logMiddleware, (req, res) => {
  res.render("addShift");
});

app.post("/addShift", authMiddleware, logMiddleware, async (req, res) => {
  await persistence.addShift(
    req.body.date,
    req.body.startTime,
    req.body.endTime
  );
  res.redirect("/shifts");
});

app.post("/assign", authMiddleware, logMiddleware, async (req, res) => {
  await persistence.assignEmployee(req.body.empId, req.body.shiftId);
  res.redirect("/shifts");
});

// ---------------- START ----------------
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});