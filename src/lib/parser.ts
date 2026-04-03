export interface ParsedLine {
  customerName: string
  productCode: string
  quantity: number
  raw: string
}

/**
 * Parse comment lines into structured orders.
 *
 * Supported formats:
 *   A01 2
 *   a01 2
 *   A01 x2
 *   A01 X2
 *   โบ A01 2
 *   text text A01 x2
 */
export function parseComments(text: string): ParsedLine[] {
  const lines = text.split('\n')
  const results: ParsedLine[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Match: optional prefix text, product code (letters+digits), optional x, quantity
    const match = trimmed.match(/^(.*?)([A-Za-z]{1,3}\d{1,3})\s*[xX]?\s*(\d+)\s*$/)

    if (match) {
      const [, namePart, code, qtyStr] = match
      results.push({
        customerName: namePart.trim(),
        productCode: code.toUpperCase(),
        quantity: parseInt(qtyStr, 10),
        raw: trimmed,
      })
    }
  }

  return results
}
