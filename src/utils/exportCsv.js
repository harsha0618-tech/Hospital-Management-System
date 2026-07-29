export function exportPatientsCsv(patients) {
  const headers = ["Patient ID","Name","Age","Gender","Doctor","Status","Consultation","Lab","Pharmacy","Total"];
  const rows = patients.map((p) => [
    p.patientId, p.name, p.age, p.gender,
    p.doctorAssigned?.name || "", p.status,
    p.consultationFee || 0, p.labTestCost || 0, p.pharmacyTotalCost || 0,
    (p.consultationFee||0)+(p.labTestCost||0)+(p.pharmacyTotalCost||0),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `patients_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}