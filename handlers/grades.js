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

		/*subjects*/
		let table = $('table').first()
		let overall = []
		let semester = []
		let subject = {}
		let headings = []
		table.find('tr[class="subTitle"]').find('td').each(function(index, element) {
			headings.push($(element).text().trim())
		})
		table.find('tr').each(function(index, element) {
			if ($(element).attr('align') === "left") {
				$(element).find('td').each(function(index, element) {
					subject[headings[index]] = $(element).text().trim()
				})
				semester.push(subject)
				subject = {}
			} else {
				if ( semester.length !== 0) {
					overall.push(semester)
					semester = []
				}
			}
		})

		for (let i = 0; i < overall.length; i++) {
			result[`sem${i + 1}`] = overall[i]
		}
		let subjects = {}
		for (let semester of overall) {
			for (let subject of semester) {
				if (!subjects[subject.Code]) {
					subjects[subject.Code] = new Set()
				}
				subjects[subject.Code].add(subject.Grade)
			}
		}
		let arrears = false
		let i = null
		for (let code of Object.keys(subjects)) {
			i = subjects[code]
			if (i.has('S') || i.has('A') || i.has('B') || i.has('C') || i.has('D')) {
				delete subjects[code]
			}
			if (!arrears && (i.has('W') || i.has('U') || i.has('I') || i.has('*'))) {
				arrears = true
			}
		}

		result['historyArrears'] = arrears
		result['standingArrears'] = Object.keys(subjects).length
		return result
	}
}