const persistence = require("./persistence");

/**
 * Compare two shifts by date then start time.
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function compareShiftDateTime(a, b) {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;
    return 0;
}

/**
 * Sort shifts by date/time (earliest first)
 * No .sort() allowed.
 * @param {Object[]} shifts
 */
function sortShifts(shifts) {
    for (let i = 0; i < shifts.length - 1; i++) {
        let minIndex = i;

        for (let j = i + 1; j < shifts.length; j++) {
            if (compareShiftDateTime(shifts[j], shifts[minIndex]) < 0) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            let temp = shifts[i];
            shifts[i] = shifts[minIndex];
            shifts[minIndex] = temp;
        }
    }
}

/**
 * Get all employees
 */
async function getAllEmployees() {
    return await persistence.getAllEmployees();
}

/**
 * Get one employee by ID
 */
async function getEmployeeById(empId) {
    return await persistence.findEmployee(empId);
}

/**
 * Update employee name + phone
 */
async function updateEmployee(empId, name, phone) {
    let employee = await persistence.findEmployee(empId);
    if (!employee) {
        return false;
    }

    await persistence.updateEmployee(empId, name, phone);
    return true;
}

/**
 * Add new employee
 */
async function addEmployee(name, phone) {
    await persistence.addEmployeeRecord({
        name: name,
        phone: phone
    });
}

/**
 * Get employee schedule (joined via assignments)
 */
async function getEmployeeSchedule(empId) {

    let assignments = await persistence.getAssignmentsByEmployee(empId);
    let result = [];

    for (let i = 0; i < assignments.length; i++) {

        let shift = await persistence.findShift(assignments[i].shiftId);

        if (shift) {
            result.push(shift);
        }
    }

    sortShifts(result);
    return result;
}

module.exports = {
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    addEmployee,
    getEmployeeSchedule
};