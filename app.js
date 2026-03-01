// Add this as the FIRST LINES in your app.js
const dns = require('dns');
const { Resolver } = require('dns');

// Create a custom resolver with Google DNS
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']);

// Override the default DNS lookup
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    
    // Use our resolver for MongoDB domains
    if (hostname.includes('mongodb.net')) {
        resolver.resolve4(hostname, (err, addresses) => {
            if (err) {
                console.error('DNS resolution failed for:', hostname);
                console.error('Error:', err.message);
                // Fallback to original lookup
                originalLookup(hostname, options, callback);
            } else {
                console.log(`✅ Resolved ${hostname} to ${addresses[0]}`);
                callback(null, addresses[0], 4);
            }
        });
    } else {
        originalLookup(hostname, options, callback);
    }
};

console.log('✅ DNS override enabled with Google DNS (8.8.8.8)');

// Then your mongoose connection code
const mongoose = require('mongoose');

// Your connection string
const uri = "mongodb+srv://Islam_60085097:456456@cluster0.vbbwgff.mongodb.net/?retryWrites=true&w=majority";

// Connect without deprecated options
mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    family: 4, // Force IPv4
    connectTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000, // 45 seconds
})
.then(() => console.log('✅ Connected to MongoDB!'))
.catch(err => {
    console.error('❌ MongoDB connection error:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    
    if (err.name === 'MongoServerSelectionError' || err.code === 'ECONNREFUSED') {
        console.error('\n📝 Troubleshooting tips:');
        console.error('1. Check if your IP is whitelisted in MongoDB Atlas (Network Access)');
        console.error('2. Verify your username and password are correct');
        console.error('3. Make sure your university network allows connections to port 27017');
        console.error('4. Try using a VPN to bypass network restrictions');
    }
});

const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");

const business = require("./business");
const persistence = require("./persistence");

const app = express();
const PORT = 3000;

// Handlebars setup
app.engine(
  "handlebars",
  engine({
    helpers: {
      morningClass: function (startTime) {
        if (startTime < "12:00") return "morning";
        return "";
      }
    }
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Landing page
app.get("/", async function (req, res) {
  let employees = await business.getAllEmployees();
  res.render("landing", { employees: employees });
});

// ==========================
// ADD EMPLOYEE ROUTES
// ==========================

// Show add employee form
app.get("/employee/add", function (req, res) {
  res.render("addEmployee");
});

// Handle add employee form
app.post("/employee/add", async function (req, res) {

  let name = req.body.name ? req.body.name.trim() : "";
  let phone = req.body.phone ? req.body.phone.trim() : "";

  if (name === "") {
    res.send("Validation failed: name must not be empty");
    return;
  }

  if (!/^\d{4}-\d{4}$/.test(phone)) {
    res.send("Validation failed: phone must be dddd-dddd");
    return;
  }

  await business.addEmployee(name, phone);

  res.redirect("/");
});

// ==========================
// EMPLOYEE DETAILS
// ==========================

app.get("/employee/:id", async function (req, res) {
  let id = req.params.id;

  let employee = await business.getEmployeeById(id);
  if (!employee) {
    res.status(404).send("Employee not found");
    return;
  }

  let shifts = await business.getEmployeeSchedule(id);

  res.render("employeeDetails", {
    employee: employee,
    shifts: shifts
  });
});

// ==========================
// EDIT EMPLOYEE
// ==========================

app.get("/employee/:id/edit", async function (req, res) {
  let id = req.params.id;

  let employee = await business.getEmployeeById(id);
  if (!employee) {
    res.status(404).send("Employee not found");
    return;
  }

  res.render("editEmployee", { employee: employee });
});

app.post("/employee/:id/edit", async function (req, res) {
  let id = req.params.id;

  let name = req.body.name ? req.body.name.trim() : "";
  let phone = req.body.phone ? req.body.phone.trim() : "";

  if (name === "") {
    res.send("Validation failed: name must not be empty");
    return;
  }

  if (!/^\d{4}-\d{4}$/.test(phone)) {
    res.send("Validation failed: phone must be dddd-dddd");
    return;
  }

  let updated = await business.updateEmployee(id, name, phone);
  if (!updated) {
    res.status(404).send("Employee not found");
    return;
  }

  res.redirect("/");
});

// ==========================
// START SERVER
// ==========================

(async function start() {
  try {
    await persistence.connect();
    app.listen(PORT, function () {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log('❌ Failed to start server:', err.message);
  }
})();