"use strict"
const login = require('./handlers/login.js')

module.exports = (app) => {
	app.get('/', login)
}