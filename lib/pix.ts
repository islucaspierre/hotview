// Gerador de código Pix Copia e Cola (BR Code / EMV QRCPS-MPM)
// Spec: https://www.bcb.gov.br/content/estabilidadefinanceira/forumpagamentos/PaymentInitiationWorkingGroup_BCB_QRCodeSpec.pdf

function f(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`
}

function pixMerchantInfo(key: string): string {
  return f("26", f("00", "BR.GOV.BCB.PIX") + f("01", key))
}

function crc16ccitt(data: string): string {
  let crc = 0xffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0")
}

function normalizeText(text: string, maxLen: number): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen) || "Lojista"
}

export function buildPixCopiaECola(
  pixKey: string,
  amount: number,
  merchantName: string,
): string {
  const name = normalizeText(merchantName, 25)
  const city = "Brasil"

  const parts = [
    f("00", "01"),
    pixMerchantInfo(pixKey),
    f("52", "0000"),
    f("53", "986"),
    amount > 0 ? f("54", amount.toFixed(2)) : "",
    f("58", "BR"),
    f("59", name),
    f("60", city),
    f("62", f("05", "***")),
    "6304",
  ].join("")

  return parts + crc16ccitt(parts)
}
