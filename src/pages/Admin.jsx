import { useState } from "react";
import PageHeader from "../components/PageHeader";
import mockPatients from "../data/mockPatients";

function Admin() {
  const [patients] = useState(mockPatients);
  const [openId, setOpenId] = useState(null);

  const toggleRow = (id) => setOpenId(openId === id ? null : id);

  const totalPatients = patients.length;
  const totalRevenue = patients.reduce(
    (sum, p) =>
      sum + (p.consultationFee || 0) + (p.labTestCost || 0) + (p.pharmacyTotalCost || 0),
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

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Full hospital overview, all departments"
          icon="🗂️"
          colorClass="admin"
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-100 rounded-card shadow-soft p-5 flex items-center gap-4"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-${s.color}-light flex items-center justify-center text-xl`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold text-${s.color}-dark`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          All Patient Records
        </h2>

        <div className="rounded-card shadow-soft border border-gray-100 overflow-x-auto relative bg-white">
          <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-admin-light text-admin-dark">
              <tr>
                <th className="sticky left-0 z-10 bg-admin-light px-4 py-3 font-semibold whitespace-nowrap border-r border-gray-300">
                  Patient ID
                </th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Name</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Age</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Gender</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Doctor</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Diagnosis</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Tests</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Prescription</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Lab ₹</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Pharmacy ₹</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Total Bill</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const isOpen = openId === patient.patientId;
                const totalBill =
                  (patient.consultationFee || 0) +
                  (patient.labTestCost || 0) +
                  (patient.pharmacyTotalCost || 0);

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
                      <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{patient.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{patient.doctorAssigned}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{patient.diagnosis || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{patient.testsRecommended.length}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{patient.prescription.length}</td>
                      <td className="px-4 py-3 whitespace-nowrap">₹{patient.labTestCost || 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">₹{patient.pharmacyTotalCost || 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold">₹{totalBill}</td>
                      <td className="px-4 py-3 text-xs text-admin-dark underline whitespace-nowrap">
                        {isOpen ? "▲ Hide" : "▼ Expand"}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={13} className="bg-admin-light px-6 py-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-md p-4 border border-reception-DEFAULT">
                              <h3 className="text-reception-dark font-semibold text-sm mb-2">Reception</h3>
                              <p className="text-xs text-gray-600">Name: {patient.name}</p>
                              <p className="text-xs text-gray-600">Age: {patient.age}</p>
                              <p className="text-xs text-gray-600">Gender: {patient.gender}</p>
                              <p className="text-xs text-gray-600">Date: {patient.date}</p>
                              <p className="text-xs text-gray-600">Doctor: {patient.doctorAssigned}</p>
                            </div>

                            <div className="bg-white rounded-md p-4 border border-doctor-DEFAULT">
                              <h3 className="text-doctor-dark font-semibold text-sm mb-2">Doctor</h3>
                              <p className="text-xs text-gray-600 mb-1">Diagnosis: {patient.diagnosis || "—"}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {patient.testsRecommended.map((t, i) => (
                                  <span key={i} className="bg-doctor-light text-doctor-dark text-xs px-2 py-0.5 rounded-full">{t}</span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {patient.prescription.map((p, i) => (
                                  <span key={i} className="bg-doctor-light text-doctor-dark text-xs px-2 py-0.5 rounded-full">{p}</span>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white rounded-md p-4 border border-lab-DEFAULT">
                              <h3 className="text-lab-dark font-semibold text-sm mb-2">Lab</h3>
                              {(patient.labReports || []).map((r, i) => (
                                <p key={i} className="text-xs text-gray-600 mb-1">{r.test}: {r.report} (₹{r.cost})</p>
                              ))}
                              <p className="text-xs font-semibold text-lab-dark mt-2">Total: ₹{patient.labTestCost || 0}</p>
                            </div>

                            <div className="bg-white rounded-md p-4 border border-pharmacy-DEFAULT">
                              <h3 className="text-pharmacy-dark font-semibold text-sm mb-2">Pharmacy</h3>
                              {(patient.medicines || []).map((m, i) => (
                                <p key={i} className="text-xs text-gray-600 mb-1">{m.name} — ₹{m.cost}</p>
                              ))}
                              <p className="text-xs font-semibold text-pharmacy-dark mt-2">Total: ₹{patient.pharmacyTotalCost || 0}</p>
                            </div>
                          </div>

                          <div className="mt-4 bg-white rounded-md p-4 border border-admin-DEFAULT flex justify-between items-center">
                            <span className="text-sm font-semibold text-admin-dark">
                              Consultation ₹{patient.consultationFee || 0} + Lab ₹{patient.labTestCost || 0} + Pharmacy ₹{patient.pharmacyTotalCost || 0}
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
      </div>
    </div>
  );
}

export default Admin;