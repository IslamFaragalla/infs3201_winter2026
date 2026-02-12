const prompt = require('prompt-sync')()
const business = require('./business')
const persistence = require('./persistence')

async function displayEmployees() {

    let employees = await persistence.getAllEmployees()

    console.log('Employee ID  Name                Phone')
    console.log('-----------  ------------------- ---------')

    for (let i = 0; i < employees.length; i++) {
        console.log(
            `${employees[i].employeeId.padEnd(13)}${employees[i].name.padEnd(20)}${employees[i].phone}`
        )
    }
}

async function addNewEmployee() {

    let name = prompt('Enter employee name: ')
    let phone = prompt('Enter phone number: ')

    await persistence.addEmployeeRecord({
        name: name,
        phone: phone
    })

    console.log('Employee added...')
}

async function scheduleEmployee() {

    let empId = prompt('Enter employee ID: ')
    let shiftId = prompt('Enter shift ID: ')

    let result = await business.assignShift(empId, shiftId)

    if (result === 'Ok') {
        console.log("Shift Recorded")
    } else {
        console.log(result)
    }
}

async function viewSchedule() {

    let empId = prompt('Enter employee ID: ')
    let details = await business.getEmployeeSchedule(empId)

    console.log('\n')
    console.log('date,start,end')

    for (let i = 0; i < details.length; i++) {
        console.log(
            `${details[i].date},${details[i].startTime},${details[i].endTime}`
        )
    }
}

async function displayMenu() {

    while (true) {

        console.log('1. Show all employees')
        console.log('2. Add new employee')
        console.log('3. Assign employee to shift')
        console.log('4. View employee schedule')
        console.log('5. Exit')

        let choice = Number(prompt("What is your choice> "))

        if (choice === 1) {
            await displayEmployees()
        }
        else if (choice === 2) {
            await addNewEmployee()
        }
        else if (choice === 3) {
            await scheduleEmployee()
        }
        else if (choice === 4) {
            await viewSchedule()
        }
        else if (choice === 5) {
            break
        }
        else {
            console.log("Error in selection")
        }

        console.log('\n')
    }

    console.log('*** Goodbye!')
}

displayMenu()
