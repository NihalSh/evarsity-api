"use strict"
const auth = require('basic-auth')
const querystring = require('querystring')
const request = require('request-promise-native')
const tesseract = require('tesseract.js')

module.exports = (req, res, next) => {
	let credentials = auth(req);
	if((credentials) && (credentials.name) && (credentials.name !== '') && (credentials.pass) && (credentials.pass !== '')){
		let j = request.jar();
		let captchaOptions = {
			uri: 'http://evarsity.srmuniv.ac.in/srmswi/Captcha',
			encoding: null,
			jar: j
		}
		request(captchaOptions)
			.then((body) => {
				return tesseract.recognize(
						new Buffer(body),
						{ tessedit_char_whitelist:
							'0123456789abcdefghijklmnopqrstuvwxyz'}
					)
			})
			.then((result) => {
				let captcha = result.text.trim()
				req.log.trace(`confidence: ${result.confidence}, text: ${captcha}`)
				let loginOptions = {
					uri: 'http://evarsity.srmuniv.ac.in/srmswi/usermanager/youLogin.jsp',
					method: 'POST',
					form: {
						'Searchtext1:txtSearchText': 'Search',
						'txtRegNumber':'iamalsouser',
						'txtPwd': 'thanksandregards',
						'txtverifycode': captcha,
						'txtSN': credentials.name,
						'txtPD': credentials.pass,
						'txtPA': 1
			   		},
					jar: j,
					simple: false,
					transform: function reverseBody(body, response, resolveWithFullResponse) {
						let statusCode = response.statusCode
						req.log.trace(statusCode)
						req.log.trace(typeof statusCode)
						req.log.trace(response.headers.location)
						if ( (statusCode === 302) && (response.headers.location === 'http://evarsity.srmuniv.ac.in/srmswi/usermanager/home.jsp') ) {
							return resolveWithFullResponse ? response : response.body;
						} else {
							throw new Error('login failed');
						}
					}
				}
				return request(loginOptions)
			})
			.then((response) => {
				let token = null
				for (let cookie of j.getCookies(captchaOptions.uri)) {
					if (cookie.hasOwnProperty('key')) {
						req.log.trace(cookie)
						if (cookie.key === "JSESSIONID") {
							token = `${cookie.value}`
							break
						}
					}
				}
				if (token === null) {
					req.log.info("login failed");
					res.sendStatus(401);
				} else {
					res.send(querystring.escape(token));
				}
			})
			.catch((err) => {
				next(err)
			})
	}else{
		req.log.info("email and password undefined or empty");
		res.sendStatus(401);
	}
}