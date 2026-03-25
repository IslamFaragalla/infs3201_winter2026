const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const dbName = "infs3201_winter2026";

let db;

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  db = client.db(dbName);
  console.log("Connected to MongoDB");
}

// ---------------- EMPLOYEES ----------------

async function getAllEmployees() {
  return await db.collection("employees").find().toArray();
}

async function getEmployeeById(id) {
  return await db.collection("employees").findOne({
    _id: new ObjectId(id)
  });
}

async function addEmployee(name, phone) {
  return await db.collection("employees").insertOne({
    name,
    phone
  });
}

async function updateEmployee(id, name, phone) {
  return await db.collection("employees").updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, phone } }
  );
}

// ---------------- SHIFTS ----------------

async function getAllShifts() {
  return await db.collection("shifts").find().toArray();
}

async function addShift(date, startTime, endTime) {
  return await db.collection("shifts").insertOne({
    date,
    startTime,
    endTime,
    employees: []
  });
}

async function getShiftsForEmployee(empId) {
  return await db.collection("shifts").find({
    employees: new ObjectId(empId)
  }).toArray();
}

// ---------------- ASSIGN ----------------

async function assignEmployee(empId, shiftId) {
  return await db.collection("shifts").updateOne(
    { _id: new ObjectId(shiftId) },
    { $addToSet: { employees: new ObjectId(empId) } }
  );
}

const crypto = require("crypto");

// USERS
async function getUser(username) {
  return await db.collection("user").findOne({ user: username });
}

// SESSIONS
async function startSession(sessionData) {
  return await db.collection("session").insertOne(sessionData);
}

async function getSession(key) {
  return await db.collection("session").findOne({ key });
}

async function deleteSession(key) {
  return await db.collection("session").deleteOne({ key });
}

async function updateSessionExpiry(key, newExpiry) {
  return await db.collection("session").updateOne(
    { key },
    { $set: { expiry: newExpiry } }
  );
}

async function addLog(entry) {
  return await db.collection("security_log").insertOne(entry);
}

module.exports = {
  connect,
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  getAllShifts,
  addShift,
  getShiftsForEmployee,
  assignEmployee,
  getUser,
  startSession,
  getSession,
  deleteSession,
  updateSessionExpiry,
  addLog,
};