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

      // Handle nested schema entries: aggregate child errors and preserve raw values.
      if (schemaEntry.schema) {
        const nestedSchema = schemaEntry.schema

        // Build nested value by merging original child values with raw values from errors when missing.
        const nestedValue = {}
        const nestedErrors = []

        for (const childKey of Object.keys(nestedSchema)) {
          const childSchemaEntry = nestedSchema[childKey]
          const childColumnTitle = childSchemaEntry.column

          const originalChildValue = (originalValue && originalValue[childKey] !== undefined)
            ? originalValue[childKey]
            : null

          const childCellErrors = errors.filter(error => error.row === sheetRowNumber && error.column === childColumnTitle)

          // Preserve value: if original child value is missing (due to validation error),
          // use the raw value from the first error as a fallback so that the consumer can see it.
          let childValue = originalChildValue
          if ((childValue === null || childValue === undefined) && childCellErrors.length > 0) {
            const firstErr = childCellErrors[0]
            childValue = (firstErr.value !== undefined) ? firstErr.value : null
          }

          nestedValue[childKey] = childValue === undefined ? null : childValue

          if (childCellErrors.length > 0) {
            for (const e of childCellErrors) {
              nestedErrors.push({ error: e.error, value: (e.value !== undefined) ? e.value : null })
            }
          }
        }

        mappedRow[key] = {
          key: key,
          // For nested objects, always show the nested object value.
          value: nestedValue,
          // If there were any child errors, expose them as an array on the parent field.
          errors: nestedErrors.length > 0 ? nestedErrors : undefined
        }
      } else {
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
    }

    mappedRows.push(mappedRow)
  }

  return {
    rows: mappedRows
  }
}
