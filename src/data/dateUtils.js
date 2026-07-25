export function getTodayFormatted() {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = today.getFullYear();

  return `${day}-${month}-${year}`; // e.g. "26-07-2026"
}