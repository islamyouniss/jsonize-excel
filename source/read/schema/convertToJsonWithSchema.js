export default function convertToJsonWithSchema(result, schema, options = {}) {
  const { rows, errors } = result
  const mappedRows = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    if (row === null) {
      continue
    }

    let sheetRowNumber
    if (options.rowIndexSourceMap) {
      // `rows` (results) in `mapToObjects` correspond to `data` shifted by 1 (ignoring header).
      // `rowIndexSourceMap` maps `data` index to original `data` index.
      // So `rows[i]` corresponds to `data[i + 1]`.
      sheetRowNumber = options.rowIndexSourceMap[i + 1] + 1
      if (sheetRowNumber === undefined || Number.isNaN(sheetRowNumber)) {
        // Should not happen.
        // Fallback to "default" logic.
        sheetRowNumber = i + 2
      }
    } else {
      sheetRowNumber = i + 2
    }

    const mappedRow = {}

    for (const key of Object.keys(schema)) {
      const schemaEntry = schema[key]
      const columnTitle = schemaEntry.column

      const originalValue = (row && row[key] !== undefined) ? row[key] : null

      const cellErrors = errors.filter(error => error.row === sheetRowNumber && error.column === columnTitle)

      let mappedErrors
      let value = originalValue
      if (cellErrors.length > 0) {
        // Convert errors to desired structure and nullify the exposed value
        mappedErrors = cellErrors.map(error => ({ error: error.error, value: error.value ?? null }))
        value = null
      }

      mappedRow[key] = {
        key: key,
        value: value,
        errors: mappedErrors
      }
    }

    mappedRows.push(mappedRow)
  }

  return {
    rows: mappedRows
  }
}
