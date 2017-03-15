"use strict"
const cheerio = require('cheerio')
const querystring = require('querystring')
const request = require('request-promise-native')

module.exports = (req, res, next) => {
	if(req.params.id){
		let options = {
			uri: 'http://5@evarsity.srmuniv.ac.in/srmswi/resource/StudentDetailsResources.jsp?resourceid=6',
			headers: {
				Cookie: `JSESSIONID=${querystring.unescape(req.params.id)}`
			}
		}
		request(options)
			.then((response) => {
				let json = parser(response)
				if (json !== null) {
					res.setHeader('Content-Type', 'application/json')
					res.send(json)
				} else {
					res.sendStatus(401)
				}
			})
			.catch((err) => {
				next(err)
			})
	}else{
		req.log.info("token absent")
		next()
	}
}

function parser(body) {
	let $ = cheerio.load(body)
	let gpa = []
	$('td[colspan="2"]').each(function(index, element) {
			gpa.push(+$(element).text().trim())
		}
	)
	if (gpa.length === 0) {
		return null
	} else {
		let result = {}
		result.cgpa = gpa[gpa.length - 1]
		for (let i = 0; i < gpa.length - 1; i++) {
			result[`sgpa${i + 1}`] = gpa[i]
		}
		return result
	}
}