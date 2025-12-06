import path from 'path'

import readXlsxFileNode from './readXlsxFileNode.js'

describe('readXlsxFileNode', () => {
	it('should read *.xlsx file on Node.js and parse it to JSON', () => {
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
			course: {
				schema: {
					isFree: {
						column: 'IS FREE',
						type: Boolean
						// Excel stores booleans as numbers:
						// `1` is `true` and `0` is `false`.
						// Such numbers are parsed into booleans.
					},
					cost: {
						column: 'COST',
						type: Number
					},
					title: {
						column: 'COURSE TITLE',
						type: String
					}
				}
			},
			contact: {
				column: 'CONTACT',
				required: true,
				type(value) {
					return '+11234567890'
				}
			}
		}

		const rowIndexSourceMap = []

		return readXlsxFileNode(path.resolve('./test/spreadsheets/course.xlsx'), { schema, rowIndexSourceMap }).then(({ rows }) => {
			// Normalize date for comparison (convert expected to UTC timezone)
			const expectedDate = convertToUTCTimezone(new Date(2018, 2, 24))
			rows.should.deep.equal([{
				date: {
					key: 'date',
					value: expectedDate,
					errors: undefined
				},
				numberOfStudents: {
					key: 'numberOfStudents',
					value: 123,
					errors: undefined
				},
				course: {
					key: 'course',
					value: {
						isFree: false,
						cost: 210.45,
						title: 'Chemistry'
					},
					errors: undefined
				},
				contact: {
					key: 'contact',
					value: '+11234567890',
					errors: undefined
				}
			}])
			rowIndexSourceMap.should.deep.equal([0, 1])
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
