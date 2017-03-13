"use strict"
const auth = require('basic-auth')
const querystring = require('querystring')
const request = require('request-promise-native')
const tesseract = require('tesseract.js')

module.exports = (req, res, next) => {
	let credentials = auth(req);
	if((credentials) && (credentials.name) && (credentials.name !== '') && (credentials.pass) && (credentials.pass !== '')){
		let j = request.jar();
		let options = {
			uri: 'http://evarsity.srmuniv.ac.in/srmswi/Captcha',
			encoding: null,
			jar: j
		}
		request(options)
			.then((body) => {
				return tesseract.recognize(
						new Buffer(body),
						{ tessedit_char_whitelist:
							'0123456789abcdefghijklmnopqrstuvwxyz'}
					)
			})
			.then((result) => {
				req.log.trace(result.confidence)
				req.log.trace(result.text.trim())
				res.sendStatus(200)
			})
			.catch((err) => {
				next(err)
			})
	}else{
		req.log.info("email and password undefined or empty");
		res.sendStatus(401);
	}
}