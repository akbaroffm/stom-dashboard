export function formatDate(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  // Elementlarni ajratib olish
  const day = String(date.getDate()).padStart(2, "0"); // Kun
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Oy (0-based, shuning uchun +1 qilinadi)
  const year = date.getFullYear(); // Yil

  return `${day}.${month}.${year}`;
}

// utils.js
export function formatNumber(number) {
  if (number == null || number === "") return "";

  // Agar string bo'lsa, raqamga o'tkazamiz
  if (typeof number === "string") {
    // Vergulni nuqtaga almashtiramiz (JavaScript decimal separator)
    number = parseFloat(number.replace(",", "."));

    // Agar raqam emas bo'lsa, bo'sh string qaytaramiz
    if (isNaN(number)) return "";
  }

  return new Intl.NumberFormat("uz-Cyrl").format(number);
}
export function formatCurrency(number) {
  return new Intl.NumberFormat("uz-Cyrl", {
    style: "currency",
    currency: "UZS",
  }).format(number);
}
