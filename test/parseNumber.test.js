import path from 'path'

import readXlsx from '../source/read/readXlsxFileNode.js'

describe('jsonize-excel', () => {
	it('should support custom `parseNumber` function', () => {
		const schema = {
			date: {
				column: 'START DATE',
				type: Date
			},
			numberOfStudents: {
				column: 'NUMBER OF STUDENTS',
				type: Number,
				required: true
			},
			cost: {
				column: 'COST',
				type: (any) => any
			}
		}

		return readXlsx(path.resolve('./test/spreadsheets/course.xlsx'), {
			schema,
			parseNumber: (string) => string
		}).then(({ rows }) => {
			rows.should.deep.equal([{
				date: {
					key: 'date',
					value: convertToUTCTimezone(new Date(2018, 2, 24)),
					errors: undefined
				},
				numberOfStudents: {
					key: 'numberOfStudents',
					value: 123,
					errors: undefined
				},
				cost: {
					key: 'cost',
					value: '210.45',
					errors: undefined
				}
			}])
		})
	})
})

// Converts timezone to UTC while preserving the same time
function convertToUTCTimezone(date) {
	// Doesn't account for leap seconds but I guess that's ok
	// given that javascript's own `Date()` does not either.
	// https://www.timeanddate.com/time/leap-seconds-background.html
	//
	// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
	//
	return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
}
