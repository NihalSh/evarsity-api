"use strict"
const querystring = require('querystring')
const request = require('request-promise-native')

module.exports = (req, res, next) => {
	let j = request.jar()
	let captchaOptions = {
		uri: 'http://evarsity.srmuniv.ac.in/srmswi/Captcha',
		encoding: null,
		jar: j
	}
	request(captchaOptions)
		.then((body) => {
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
				req.log.info("captcha cookie failed")
				res.sendStatus(502)
			} else {
				let image = new Buffer(body, 'binary').toString('base64')
				res.setHeader('Content-Type', 'application/json')
				res.send( [image, querystring.escape(token)] )
			}
		})
		.catch((err) => {
			next(err)
		})
}