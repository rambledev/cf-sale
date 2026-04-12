export interface ParsedLine {
  customerName: string
  productCode: string
  size?: string
  quantity: number
  raw: string
}

/**
 * Parse comment lines into structured orders.
 *
 * Supported formats (slash-delimited — primary):
 *   โบ/A01/2              → name=โบ, code=A01, qty=2
 *   โบ/A01/M/2            → name=โบ, code=A01, size=M, qty=2
 *
 * Legacy formats (space-separated — still supported):
 *   A01 2
 *   A01 x2
 *   โบ A01 2
 */
export function parseComments(text: string): ParsedLine[] {
  const results: ParsedLine[] = []

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const parsed = parseSlash(trimmed) ?? parseLegacy(trimmed)
    if (parsed) results.push(parsed)
  }

  return results
}

// ── Slash format ─────────────────────────────────────────
function parseSlash(line: string): ParsedLine | null {
  if (!line.includes('/')) return null

  const parts = line.split('/').map((s) => s.trim())

  if (parts.length === 3) {
    // ชื่อ/รหัส/จำนวน
    const [name, code, qtyStr] = parts
    const qty = parseInt(qtyStr, 10)
    if (!isValidCode(code) || isNaN(qty) || qty < 1) return null

    return {
      customerName: name,
      productCode: code.toUpperCase(),
      quantity: qty,
      raw: line,
    }
  }

  if (parts.length === 4) {
    // ชื่อ/รหัส/ไซส์/จำนวน
    const [name, code, size, qtyStr] = parts
    const qty = parseInt(qtyStr, 10)
    if (!isValidCode(code) || isNaN(qty) || qty < 1) return null

    return {
      customerName: name,
      productCode: code.toUpperCase(),
      size: size.toUpperCase(),
      quantity: qty,
      raw: line,
    }
  }

  return null
}

// ── Legacy space format ───────────────────────────────────
function parseLegacy(line: string): ParsedLine | null {
  const match = line.match(/^(.*?)([A-Za-z]{1,3}\d{1,3})\s*[xX]?\s*(\d+)\s*$/)
  if (!match) return null

  const [, namePart, code, qtyStr] = match
  return {
    customerName: namePart.trim(),
    productCode: code.toUpperCase(),
    quantity: parseInt(qtyStr, 10),
    raw: line,
  }
}

// ── Helpers ───────────────────────────────────────────────
function isValidCode(code: string): boolean {
  return /^[A-Za-z]{1,3}\d{1,3}$/.test(code)
}
