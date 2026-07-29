function EMRModal({ patient, onClose }) {
  if (!patient) return null;
  const history = [
    { date: patient.date, doctorAssigned: patient.doctorAssigned, diagnosis: patient.diagnosis, testsRecommended: patient.testsRecommended, prescription: patient.prescription, isCurrent: true },
    ...(patient.visitHistory || []),
  ];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-card shadow-card-hover max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
        <h2 className="text-lg font-bold text-brand-dark mb-1">{patient.name} — EMR</h2>
        <p className="text-xs text-gray-400 mb-4">{patient.patientId} · {patient.age} / {patient.gender}</p>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Visit History</h3>
          <div className="flex flex-col gap-2">
            {history.map((v, i) => (
              <div key={i} className="bg-gray-50 rounded-md p-3 text-xs border border-gray-100">
                <p className="font-medium mb-1">{v.date} {v.isCurrent && "(Current)"} — {v.doctorAssigned?.name}</p>
                <p>Diagnosis: {v.diagnosis || "—"}</p>
                {v.testsRecommended?.length > 0 && <p>Tests: {v.testsRecommended.join(", ")}</p>}
                {v.prescription?.length > 0 && <p>Prescription: {v.prescription.join(", ")}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Lab Reports</h3>
          {(patient.labReports || []).length === 0 ? <p className="text-xs text-gray-400">None</p> :
            patient.labReports.map((r, i) => <p key={i} className="text-xs">{r.test}: {r.report} (₹{r.cost})</p>)}
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Medicines Dispensed</h3>
          {(patient.medicines || []).length === 0 ? <p className="text-xs text-gray-400">None</p> :
            patient.medicines.map((m, i) => <p key={i} className="text-xs">{m.name} — ₹{m.cost}</p>)}
        </div>

        {(patient.vitals || []).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Vitals</h3>
            {patient.vitals.map((v, i) => (
              <p key={i} className="text-xs">{v.date}: BP {v.bp || "—"}, Temp {v.temp || "—"}, Pulse {v.pulse || "—"}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EMRModal;