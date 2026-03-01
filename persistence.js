const { MongoClient } = require("mongodb");
const fs = require("fs/promises");

const DB_NAME = "infs3201_winter2026";

let _client = null;
let _db = null;

async function connect() {
    if (_db) return;

    let uri = (await fs.readFile("mongodb_uri.txt", "utf8")).trim();
    if (!uri) {
        throw new Error("MongoDB URI is empty");
    }

    _client = new MongoClient(uri);
    await _client.connect();
    _db = _client.db("infs3201_winter2026");
}

async function getAllEmployees() {
    await connect();
    return await _db.collection("employees").find({}).toArray();
}

async function findEmployee(empId) {
    await connect();
    return await _db.collection("employees").findOne({ employeeId: empId });
}

async function updateEmployee(empId, name, phone) {
    await connect();
    await _db.collection("employees").updateOne(
        { employeeId: empId },
        { $set: { name: name, phone: phone } }
    );
}

async function addEmployeeRecord(emp) {
    await connect();

    let last = await _db.collection("employees")
        .find({})
        .sort({ employeeId: -1 })
        .limit(1)
        .toArray();

    let maxNum = 0;

    if (last.length > 0) {
        let n = Number(last[0].employeeId.slice(1));
        if (!Number.isNaN(n)) maxNum = n;
    }

    let newId = `E${String(maxNum + 1).padStart(3, "0")}`;

    await _db.collection("employees").insertOne({
        employeeId: newId,
        name: emp.name,
        phone: emp.phone
    });
}

async function getAssignmentsByEmployee(empId) {
    await connect();
    return await _db.collection("assignments")
        .find({ employeeId: empId })
        .toArray();
}

async function findShift(shiftId) {
    await connect();
    return await _db.collection("shifts")
        .findOne({ shiftId: shiftId });
}

module.exports = {
    connect,
    getAllEmployees,
    findEmployee,
    updateEmployee,
    addEmployeeRecord,   // ← THIS WAS MISSING
    getAssignmentsByEmployee,
    findShift
};