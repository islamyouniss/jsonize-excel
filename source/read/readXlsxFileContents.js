import readXlsx from './readXlsx.js'

import mapToObjects from './schema/mapToObjects.js'
import convertToJsonWithSchema from './schema/convertToJsonWithSchema.js'

export default function readXlsxFileContents(entries, xml, { schema, ...options }) {
  if (options.map) {
    throw new Error('`map` option was removed. Pass a `schema` option instead.')
  }
  // `readXlsx()` function creates `options.rowIndexSourceMap` property.
  // It maps parsed data row indexes to spreadsheet row indexes.
  // That's because empty rows are ignored (discarded) when parsing using `schema`.
  const result = readXlsx(entries, xml, { ...options, properties: schema || options.properties })
  if (schema) {
    const mapped = mapToObjects(result.data, schema, {
      ...options,
      properties: result.properties
    })
    // When using a schema, return the standard shape { rows, errors }
    // Consumers can opt-in to a different shape via convertToJsonWithSchema().
    return convertToJsonWithSchema(mapped, schema, { ...options, rowIndexSourceMap: mapped.rowIndexSourceMap })
  }
  return result
}