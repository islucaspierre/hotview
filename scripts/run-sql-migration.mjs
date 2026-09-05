// Ferramenta de manutenção pontual — roda um arquivo .sql inteiro numa
// transação contra o Postgres do Supabase. Não é usada pelo app em runtime.
// Uso: node scripts/run-sql-migration.mjs <caminho-do-arquivo.sql>
import { readFile } from "node:fs/promises"
import { Client } from "pg"

const filePath = process.argv[2]
if (!filePath) {
  console.error("Uso: node scripts/run-sql-migration.mjs <caminho-do-arquivo.sql>")
  process.exit(1)
}

const rawConnectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL
if (!rawConnectionString) {
  console.error("Defina POSTGRES_URL_NON_POOLING (ou POSTGRES_URL) no ambiente.")
  process.exit(1)
}
// Remove sslmode da query string: o modo é controlado explicitamente abaixo,
// via a opção `ssl`, para evitar verificação de certificado incompatível com
// o proxy do Supabase.
const connectionString = rawConnectionString.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "")

const sql = await readFile(filePath, "utf8")
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

await client.connect()
try {
  await client.query("begin")
  await client.query(sql)
  await client.query("commit")
  console.log(`OK: ${filePath} aplicado com sucesso.`)
} catch (error) {
  await client.query("rollback")
  console.error("Falhou, rollback aplicado:", error.message)
  process.exitCode = 1
} finally {
  await client.end()
}
