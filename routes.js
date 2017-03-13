"use strict"
const login = require('./handlers/login.js')
const profile = require('./handlers/profile.js')

module.exports = (app) => {
	app.get('/', login)
	app.get('/profile/:id', profile)
}