"use strict"
const auth = require('basic-auth')
const querystring = require('querystring')
const request = require('request-promise-native')

module.exports = (req, res, next) => {
	if(req.params.id){
		let credentials = auth(req)
		if((credentials) && (credentials.name) && (credentials.pass)){
			req.log.trace(`captcha: ${req.params.captcha}, id: ${credentials.name}, pass: ${credentials.pass}`)
			let options = {
				uri: 'http://evarsity.srmuniv.ac.in/srmswi/usermanager/youLogin.jsp',
				method: 'POST',
				form: {
					'Searchtext1:txtSearchText': 'Search',
					'txtRegNumber':'iamalsouser',
					'txtPwd': 'thanksandregards',
					'txtverifycode': req.params.captcha,
					'txtSN': credentials.name,
					'txtPD': credentials.pass,
					'txtPA': 1
		   		},
				headers: {
					Cookie: `JSESSIONID=${querystring.unescape(req.params.id)}`,
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				simple: false,
				transform: (body, response, resolveWithFullResponse) => {
					let statusCode = response.statusCode
					req.log.trace(response)
					if ( (statusCode === 302) && (response.headers.location === 'http://evarsity.srmuniv.ac.in/srmswi/usermanager/home.jsp') ) {
						return resolveWithFullResponse ? response : response.body
					} else {
						throw new Error('login failed')
					}
				}
			}
			request(options)
				.then((body) => {
					res.sendStatus(200)
				})
				.catch((err) => {
					req.log.error(err)
					res.sendStatus(401)
				})
		}else{
			req.log.info("registration number or password undefined or empty")
			res.sendStatus(401)
		}
	} else {
		req.log.info("token absent")
		next()
	}
}