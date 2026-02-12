const fs = require('fs/promises')

/**
 * Get all employees
 */
async function getAllEmployees() {
    let rawData = await fs.readFile('employees.json')
    return JSON.parse(rawData)
}

/**
 * Get all shifts
 */
async function getAllShifts() {
    let rawData = await fs.readFile('shifts.json')
    return JSON.parse(rawData)
}

/**
 * Get all assignments
 */
async function getAllAssignments() {
    let rawData = await fs.readFile('assignments.json')
    return JSON.parse(rawData)
}

/**
 * Find employee
 */
async function findEmployee(empId) {
    let list = await getAllEmployees()
    for (let i = 0; i < list.length; i++) {
        if (list[i].employeeId === empId) {
            return list[i]
        }
    }
    return undefined
}

/**
 * Find shift
 */
async function findShift(shiftId) {
    let list = await getAllShifts()
    for (let i = 0; i < list.length; i++) {
        if (list[i].shiftId === shiftId) {
            return list[i]
        }
    }
    return undefined
}

/**
 * Find assignment
 */
async function findAssignment(empId, shiftId) {
    let list = await getAllAssignments()
    for (let i = 0; i < list.length; i++) {
        if (list[i].employeeId === empId &&
            list[i].shiftId === shiftId) {
            return list[i]
        }
    }
    return undefined
}

/**
 * Add assignment
 */
async function addAssignment(empId, shiftId) {
    let list = await getAllAssignments()
    list.push({ employeeId: empId, shiftId: shiftId })
    await fs.writeFile('assignments.json',
        JSON.stringify(list, null, 4))
}

/**
 * Add employee
 */
async function addEmployeeRecord(emp) {

    let list = await getAllEmployees()
    let maxId = 0

    for (let i = 0; i < list.length; i++) {
        let eid = Number(list[i].employeeId.slice(1))
        if (eid > maxId) {
            maxId = eid
        }
    }

    emp.employeeId = `E${String(maxId + 1).padStart(3, '0')}`
    list.push(emp)

    await fs.writeFile('employees.json',
        JSON.stringify(list, null, 4))
}

/**
 * Get config
 */
async function getConfig() {
    let raw = await fs.readFile('config.json')
    return JSON.parse(raw)
}

module.exports = {
    getAllEmployees,
    getAllShifts,
    getAllAssignments,
    findEmployee,
    findShift,
    findAssignment,
    addAssignment,
    addEmployeeRecord,
    getConfig
}
