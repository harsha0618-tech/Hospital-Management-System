// In-memory daily counter (resets on page reload / new day, same limitation as patientIdGenerator)
let queueState = {
  date: null,
  lastNumber: 0,
};

export function generateQueueNumber() {
  const today = new Date().toDateString();

  if (queueState.date !== today) {
    queueState.date = today;
    queueState.lastNumber = 0;
  }

  queueState.lastNumber += 1;
  return queueState.lastNumber;
}