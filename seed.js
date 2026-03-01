const fs = require("fs/promises");
const { MongoClient } = require("mongodb");

const DB_NAME = "infs3201_winter2026";

async function readJson(filename) {
  let raw = await fs.readFile(filename, "utf8");
  return JSON.parse(raw);
}

async function main() {
  let uri = "";

  try {
    uri = (await fs.readFile("mongodb_uri.txt", "utf8")).trim();
  } catch {
    console.log("Missing mongodb_uri.txt file.");
    return;
  }

  if (!uri) {
    console.log("MongoDB URI is empty.");
    return;
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);

  const employees = await readJson("employees.json");
  const shifts = await readJson("shifts.json");
  const assignments = await readJson("assignments.json");

  await db.collection("employees").deleteMany({});
  await db.collection("shifts").deleteMany({});
  await db.collection("assignments").deleteMany({});

  await db.collection("employees").insertMany(employees);
  await db.collection("shifts").insertMany(shifts);
  await db.collection("assignments").insertMany(assignments);

  await client.close();

  console.log("Seed complete.");
}

main();