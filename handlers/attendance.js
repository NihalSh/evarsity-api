"use strict"
const cheerio = require('cheerio')
const querystring = require('querystring')
const request = require('request-promise-native')

module.exports = (req, res, next) => {
	if(req.params.id){
		let options = {
			uri: 'http://5@evarsity.srmuniv.ac.in/srmswi/resource/StudentDetailsResources.jsp?resourceid=7',
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
	let $ = cheerio.load(body);
	let table = []
	$('table').first().find('tr:nth-of-type(n + 3)').each( function (index, element) {
			let row = []
			$(element).find('td').each((index, element) => {
				row.push($(element).text().trim())
			})
			table.push(row)
		}
	)
	table.pop()
	if (table.length === 0) {
		return null
	} else {
		return table
	}
}