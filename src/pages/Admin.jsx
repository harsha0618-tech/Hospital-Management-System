import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { usePatients } from "../context/PatientContext";
import EMRModal from "../components/EMRModal";

function Admin() {
  const { patients } = usePatients();
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleRow = (id) => setOpenId(openId === id ? null : id);
  const [emrPatientId, setEmrPatientId] = useState(null);
  const totalPatients = patients.length;
  const totalRevenue = patients.reduce(
    (sum, p) => sum + (p.consultationFee || 0) + (p.labTestCost || 0) + (p.pharmacyTotalCost || 0),
    0
  );
  const pendingTests = patients.reduce(
    (sum, p) => sum + Math.max((p.testsRecommended?.length || 0) - (p.labReports?.length || 0), 0),
    0
  );
  const pendingMeds = patients.reduce(
    (sum, p) => sum + Math.max((p.prescription?.length || 0) - (p.medicines?.length || 0), 0),
    0
  );

  const statCards = [
    { label: "Total Patients", value: totalPatients, icon: "🧑‍🤝‍🧑", color: "admin" },
    { label: "Total Revenue", value: `₹${totalRevenue}`, icon: "💰", color: "reception" },
    { label: "Tests Pending", value: pendingTests, icon: "🧪", color: "lab" },
    { label: "Medicines Pending", value: pendingMeds, icon: "💊", color: "pharmacy" },
  ];

  const filteredPatients = patients.filter(
    (p) =>
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Full hospital overview, all departments"
      icon="🗂️"
      colorClass="admin"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-card shadow-soft p-5 flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl bg-${s.color}-light flex items-center justify-center text-xl`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-bold text-${s.color}-dark`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">All Patient Records</h2>

      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="admin" />

      <div className="rounded-card shadow-soft border border-gray-100 overflow-x-auto relative bg-white">
        <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
          <thead className="bg-admin-light text-admin-dark">
            <tr>
              <th className="sticky left-0 z-10 bg-admin-light px-4 py-3 font-semibold whitespace-nowrap border-r border-gray-300">
                Patient ID
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Queue</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Name</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Age</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Gender</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Doctor</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Nurse</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Status</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Diagnosis</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Visits</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Lab ₹</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Pharmacy ₹</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Total Bill</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Details</th>
              
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => {
              const isOpen = openId === patient.patientId;
              const totalBill =
                (patient.consultationFee || 0) + (patient.labTestCost || 0) + (patient.pharmacyTotalCost || 0);

              const fullHistory = [
                {
                  date: patient.date,
                  doctorAssigned: patient.doctorAssigned,
                  diagnosis: patient.diagnosis,
                  testsRecommended: patient.testsRecommended,
                  prescription: patient.prescription,
                  isCurrent: true,
                },
                ...(patient.visitHistory || []),
              ];

              return (
                <>
                  <tr
                    key={patient.patientId}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleRow(patient.patientId)}
                  >
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-admin-dark whitespace-nowrap border-r border-gray-200">
                      {patient.patientId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {patient.queueNumber ? (
                        <span className="text-xs font-medium text-admin-dark">
                          #{patient.queueNumber} · {patient.queueStatus || "—"}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{patient.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {patient.doctorAssigned?.name}
                      <span className="text-xs text-gray-400 block">
                        {patient.doctorAssigned?.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{patient.nurseAssigned}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {patient.status === "Discharged" ? (
                        <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                          Discharged
                        </span>
                      ) : (
                        <span className="bg-reception-light text-reception-dark text-xs font-medium px-2.5 py-1 rounded-full">
                          Admitted
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{patient.diagnosis || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{fullHistory.length}</td>
                    <td className="px-4 py-3 whitespace-nowrap">₹{patient.labTestCost || 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap">₹{patient.pharmacyTotalCost || 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold">₹{totalBill}</td>
                    <td className="px-4 py-3 text-xs text-admin-dark underline whitespace-nowrap">
                      {isOpen ? "▲ Hide" : "▼ Expand"}
                    </td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan={15} className="bg-admin-light px-6 py-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white rounded-md p-4 border border-reception-DEFAULT">
                            <h3 className="text-reception-dark font-semibold text-sm mb-2">Reception</h3>
                            <p className="text-xs text-gray-600">Name: {patient.name}</p>
                            <p className="text-xs text-gray-600">Age: {patient.age}</p>
                            <p className="text-xs text-gray-600">Gender: {patient.gender}</p>
                            <p className="text-xs text-gray-600">Nurse: {patient.nurseAssigned}</p>
                            <p className="text-xs text-gray-600">Status: {patient.status}</p>
                          </div>

                          <div className="bg-white rounded-md p-4 border border-doctor-DEFAULT">
                            <h3 className="text-doctor-dark font-semibold text-sm mb-2">Doctor</h3>
                            <p className="text-xs text-gray-600 mb-1">
                              {patient.doctorAssigned?.name} ({patient.doctorAssigned?.department})
                            </p>
                            <p className="text-xs text-gray-600">Diagnosis: {patient.diagnosis || "—"}</p>
                          </div>

                          <div className="bg-white rounded-md p-4 border border-lab-DEFAULT">
                            <h3 className="text-lab-dark font-semibold text-sm mb-2">Lab</h3>
                            {(patient.labReports || []).length === 0 ? (
                              <span className="text-xs text-gray-400">No reports</span>
                            ) : (
                              patient.labReports.map((r, i) => (
                                <p key={i} className="text-xs text-gray-600 mb-1">
                                  {r.test}: {r.report} (₹{r.cost})
                                </p>
                              ))
                            )}
                            <p className="text-xs font-semibold text-lab-dark mt-2">
                              Total: ₹{patient.labTestCost || 0}
                            </p>
                          </div>

                          <div className="bg-white rounded-md p-4 border border-pharmacy-DEFAULT">
                            <h3 className="text-pharmacy-dark font-semibold text-sm mb-2">Pharmacy</h3>
                            {(patient.medicines || []).length === 0 ? (
                              <span className="text-xs text-gray-400">No medicines dispensed</span>
                            ) : (
                              patient.medicines.map((m, i) => (
                                <p key={i} className="text-xs text-gray-600 mb-1">
                                  {m.name} — ₹{m.cost}
                                </p>
                              ))
                            )}
                            <p className="text-xs font-semibold text-pharmacy-dark mt-2">
                              Total: ₹{patient.pharmacyTotalCost || 0}
                            </p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-admin-dark font-semibold text-sm mb-3">
                            Complete Visit History
                          </h3>
                          <div className="flex flex-col gap-2">
                            {fullHistory.map((visit, idx) => (
                              <div
                                key={idx}
                                className={`bg-white rounded-md p-3 border text-xs ${
                                  visit.isCurrent ? "border-admin-DEFAULT" : "border-gray-200"
                                }`}
                              >

                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-admin-dark">
                                    {visit.date}
                                    {visit.isCurrent && (
                                      <span className="ml-2 bg-admin-light text-admin-dark text-[10px] px-2 py-0.5 rounded-full">
                                        Current
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-gray-400">
                                    {visit.doctorAssigned?.name} ({visit.doctorAssigned?.department})
                                  </span>
                                </div>
                                <p className="text-gray-600">Diagnosis: {visit.diagnosis || "—"}</p>
                                {visit.testsRecommended?.length > 0 && (
                                  <p className="text-gray-600">
                                    Tests: {visit.testsRecommended.join(", ")}
                                  </p>
                                )}
                                {visit.prescription?.length > 0 && (
                                  <p className="text-gray-600">
                                    Prescription: {visit.prescription.join(", ")}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white rounded-md p-4 border border-admin-DEFAULT flex justify-between items-center">
                          <span className="text-sm font-semibold text-admin-dark">
                            Consultation ₹{patient.consultationFee || 0} + Lab ₹
                            {patient.labTestCost || 0} + Pharmacy ₹{patient.pharmacyTotalCost || 0}
                          </span>
                          <span className="text-lg font-bold text-admin-dark">Total: ₹{totalBill}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      {emrPatientId && (
  <EMRModal patient={patients.find((p) => p.patientId === emrPatientId)} onClose={() => setEmrPatientId(null)} />
)}
    </DashboardLayout>
  );
}

export default Admin;