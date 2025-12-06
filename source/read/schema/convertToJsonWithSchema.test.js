import convertToJsonWithSchema from './convertToJsonWithSchema.js'

describe('convertToJsonWithSchema', () => {
    it('should convert output to the desired format', () => {
        const input = {
            rows: [
                {
                    trainingType: "program",
                    name: "pro 1",
                    category: "leaders_learning",
                    targetAudience: "pro 1 TA"
                },
                null,
                null
            ],
            errors: [
                {
                    error: "required",
                    row: 2,
                    column: "Start Date"
                },
                {
                    error: "required",
                    row: 2,
                    column: "End Date"
                }
            ]
        }

        const schema = {
            trainingType: {
                column: "Training Type",
                type: String
            },
            name: {
                column: "Name",
                type: String
            },
            category: {
                column: "Category",
                type: String
            },
            targetAudience: {
                column: "Target Audience",
                type: String
            },
            startDate: {
                column: "Start Date",
                type: Date,
                required: true
            },
            endDate: {
                column: "End Date",
                type: Date,
                required: true
            }
        }

        const expected = {
            rows: [
                {
                    trainingType: {
                        key: "trainingType",
                        value: "program",
                        errors: undefined
                    },
                    name: {
                        key: "name",
                        value: "pro 1",
                        errors: undefined
                    },
                    category: {
                        key: "category",
                        value: "leaders_learning",
                        errors: undefined
                    },
                    targetAudience: {
                        key: "targetAudience",
                        value: "pro 1 TA",
                        errors: undefined
                    },
                    startDate: {
                        key: "startDate",
                        value: null,
                        errors: [{ error: 'required', value: null }]
                    },
                    endDate: {
                        key: "endDate",
                        value: null,
                        errors: [{ error: 'required', value: null }]
                    },
                }
            ]
        }

        const result = convertToJsonWithSchema(input, schema)
        result.should.deep.equal(expected)
    })
})
