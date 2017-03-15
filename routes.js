"use strict"
const grades = require('./handlers/grades.js')
const home = require('./handlers/home.js')
const login = require('./handlers/login.js')
const profile = require('./handlers/profile.js')

module.exports = (app) => {
	app.get('/', home)
	app.get('/login/:id/:captcha', login)
	app.get('/profile/:id', profile)
	app.get('/grades/:id', grades)
}