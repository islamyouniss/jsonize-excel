import path from 'path'

import readXlsx from '../source/read/readXlsxFileNode.js'

describe('jsonize-excel', () => {
	it('should support `required` function (returns `true`)', () => {
		const schema = {
			courseTitle: {
				column: 'COURSE TITLE',
				type: String
			},
			notExists: {
				column: 'NOT EXISTS',
				type: Number,
				required: (row) => row.courseTitle === 'Chemistry'
			}
		}

		return readXlsx(path.resolve('./test/spreadsheets/course.xlsx'), {
			schema
		}).then(({ rows }) => {
			rows.should.deep.equal([{
				courseTitle: {
					key: 'courseTitle',
					value: 'Chemistry',
					errors: undefined
				},
				notExists: {
					key: 'notExists',
					value: null,
					errors: [{
						error: 'required',
						value: null
					}]
				}
			}])
		})
	})

	it('should support `required` function (returns `false`)', () => {
		const schema = {
			courseTitle: {
				column: 'COURSE TITLE',
				type: String
			},
			notExists: {
				column: 'NOT EXISTS',
				type: Number,
				required: (row) => row.courseTitle !== 'Chemistry'
			}
		}

		return readXlsx(path.resolve('./test/spreadsheets/course.xlsx'), {
			schema
		}).then(({ rows }) => {
			rows.should.deep.equal([{
				courseTitle: {
					key: 'courseTitle',
					value: 'Chemistry',
					errors: undefined
				},
				notExists: {
					key: 'notExists',
					value: null, // Value is null because it's missing, but no error
					errors: undefined
				}
			}])
		})
	})
})