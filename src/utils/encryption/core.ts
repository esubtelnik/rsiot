import { shannonFanoEncode, shannonFanoDecode, CodeTableEntry } from "./shannon-fano";
import { encryptWithAlphabet, decryptWithAlphabet } from "./caesar-cipher";
import { getOrCreateKey } from "./key-manager";

export function serializeTable(table: CodeTableEntry[]): string {
   // Используем другой разделитель, чтобы избежать конфликта с символом =
   return table.map(e => `${encodeURIComponent(e.char)}:${e.code}`).join("|")
}

export function deserializeTable(str: string): CodeTableEntry[] {
   if (!str) return []
   return str.split("|").map(pair => {
     const [encodedChar, code] = pair.split(":")
     return { char: decodeURIComponent(encodedChar), code }
   }).filter(e => e.char !== undefined && e.code) // Убираем пустые записи
}

export async function encryptData(data: string): Promise<string> {
   const { encoded, table } = shannonFanoEncode(data)

   const tableStr = serializeTable(table)
   const payload = `${encoded}::${tableStr}`
   const key = await getOrCreateKey()
   const encrypted = encryptWithAlphabet(payload, key)
   return encrypted
}

export async function decryptData(encrypted: string): Promise<string> {
  const key = await getOrCreateKey()
  const decrypted = decryptWithAlphabet(encrypted, key)

  const [encoded, tableStr] = decrypted.split("::")
  const table = deserializeTable(tableStr)
  console.log("table", table)
  const decoded = shannonFanoDecode(encoded, table)
  console.log("decoded", decoded)
  return decoded
}
