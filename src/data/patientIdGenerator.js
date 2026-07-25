// In-memory counter (resets on page reload since there's no backend yet)
let idCounter = {
  year: null,
  lastNumber: 0,
};

export function generatePatientId() {
  const currentYear = new Date().getFullYear().toString().slice(-2); // e.g. "26"

  // Reset counter if year has changed (or first run)
  if (idCounter.year !== currentYear) {
    idCounter.year = currentYear;
    idCounter.lastNumber = 0;
  }

  idCounter.lastNumber += 1;

  if (idCounter.lastNumber > 9999) {
    // Placeholder handling — real limit logic can be improved once backend exists
    console.error("Patient ID limit reached for this year (9999).");
    return null;
  }

  const paddedNumber = String(idCounter.lastNumber).padStart(4, "0"); // e.g. "0001"

  return `MCR${currentYear}${paddedNumber}`; // e.g. "MCR260001"
}