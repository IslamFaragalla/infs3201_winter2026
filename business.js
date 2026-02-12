const persistence = require('./persistence')

/**
 * computeShiftDuration
 * Generated using ChatGPT
 * Prompt: "Write a JavaScript function that calculates number of hours between two HH:MM times"
 */
function computeShiftDuration(startTime, endTime) {

    const startParts = startTime.split(":")
    const endParts = endTime.split(":")

    const startMinutes =
        parseInt(startParts[0]) * 60 + parseInt(startParts[1])

    const endMinutes =
        parseInt(endParts[0]) * 60 + parseInt(endParts[1])

    return (endMinutes - startMinutes) / 60
}

/**
 * Assign shift with maxDailyHours check
 */
async function assignShift(empId, shiftId) {

    let employee = await persistence.findEmployee(empId)
    if (!employee) {
        return "Employee does not exist"
    }

    let shift = await persistence.findShift(shiftId)
    if (!shift) {
        return "Shift does not exist"
    }

    let existing = await persistence.findAssignment(empId, shiftId)
    if (existing) {
        return "Employee already assigned to shift"
    }

    // ---- MAX DAILY HOURS FEATURE ----

    let config = await persistence.getConfig()
    let maxHours = config.maxDailyHours

    let assignments = await persistence.getAllAssignments()
    let totalHours = 0

    for (let i = 0; i < assignments.length; i++) {

        if (assignments[i].employeeId === empId) {

            let existingShift =
                await persistence.findShift(assignments[i].shiftId)

            if (existingShift.date === shift.date) {

                totalHours += computeShiftDuration(
                    existingShift.startTime,
                    existingShift.endTime
                )
            }
        }
    }

    let newHours =
        computeShiftDuration(shift.startTime, shift.endTime)

    if (totalHours + newHours > maxHours) {
        return "Daily hour limit exceeded"
    }

    await persistence.addAssignment(empId, shiftId)

    return "Ok"
}

/**
 * Get employee schedule
 */
async function getEmployeeSchedule(empId) {

    let assignments = await persistence.getAllAssignments()
    let shifts = await persistence.getAllShifts()
    let result = []

    for (let i = 0; i < assignments.length; i++) {

        if (assignments[i].employeeId === empId) {

            for (let j = 0; j < shifts.length; j++) {

                if (shifts[j].shiftId === assignments[i].shiftId) {
                    result.push(shifts[j])
                }
            }
        }
    }

    return result
}

module.exports = {
    assignShift,
    getEmployeeSchedule
}
