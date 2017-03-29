"use strict"
const attendance = require('./handlers/attendance.js')
const grades = require('./handlers/grades.js')
const login = require('./handlers/login.js')
const profile = require('./handlers/profile.js')

module.exports = (app) => {
	app.get('/', login)
	app.get('/profile/:id', profile)
	app.get('/grades/:id', grades)
	app.get('/attendance/:id', attendance)
}