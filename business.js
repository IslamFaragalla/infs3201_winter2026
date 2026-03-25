const persistence = require("./persistence");

/**
 * Get all employees
 */
async function getAllEmployees() {
  return await persistence.getAllEmployees();
}

/**
 * Get one employee by ID
 */
async function getEmployeeById(id) {
  return await persistence.getEmployeeById(id);
}

/**
 * Add employee
 */
async function addEmployee(name, phone) {
  return await persistence.addEmployee(name, phone);
}

/**
 * Update employee
 */
async function updateEmployee(id, name, phone) {
  return await persistence.updateEmployee(id, name, phone);
}

/**
 * Get employee schedule
 */
async function getEmployeeSchedule(id) {
  return await persistence.getEmployeeSchedule(id);
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  getEmployeeSchedule
};