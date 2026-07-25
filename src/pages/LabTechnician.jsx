import { useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import mockPatients from "../data/mockPatients";

const columns = ["Patient ID", "Name", "Age", "Gender", "Doctor", "Test Reports"];

function LabTechnician() {
  const [patients, setPatients] = useState(mockPatients);
  const [openId, setOpenId] = useState(null);

  const [formPatientId, setFormPatientId] = useState("");
  const [formTest, setFormTest] = useState("");
  const [formReport, setFormReport] = useState("");
  const [formCost, setFormCost] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formPatientId || !formTest || !formReport) return;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId !== formPatientId) return p;
        const entry = { test: formTest, report: formReport, cost: Number(formCost) || 0 };
        const existing = Array.isArray(p.labReports) ? p.labReports : [];
        return {
          ...p,
          labReports: [...existing, entry],
          labTestCost: (p.labTestCost || 0) + entry.cost,
          labReport: entry.report,
        };
      })
    );

    setFormPatientId("");
    setFormTest("");
    setFormReport("");
    setFormCost("");
  };

  const openPatient = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Lab Technician Dashboard"
          subtitle="Submit test reports and results"
          icon="🧪"
          colorClass="lab"
        />

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Add Test Report
          </h2>
          <form
            onSubmit={handleFormSubmit}
            className="bg-white border border-gray-100 rounded-card shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Patient ID
              </label>
              <select
                value={formPatientId}
                onChange={(e) => setFormPatientId(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT"
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.patientId} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Test Name
              </label>
              <input
                type="text"
                value={formTest}
                onChange={(e) => setFormTest(e.target.value)}
                placeholder="e.g. Blood Test"
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Report / Result
              </label>
              <input
                type="text"
                value={formReport}
                onChange={(e) => setFormReport(e.target.value)}
                placeholder="e.g. Normal range"
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Cost (₹)
              </label>
              <input
                type="number"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                placeholder="e.g. 500"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT"
              />
            </div>

            <div className="lg:col-span-4 flex justify-end mt-1">
              <button
                type="submit"
                className="bg-lab-DEFAULT text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-lab-dark transition"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Patient Records
        </h2>
        <DataTable
          columns={columns}
          rows={patients}
          renderRow={(patient) => (
            <>
              <tr
                key={patient.patientId}
                className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => openPatient(patient.patientId)}
              >
                <td className="px-4 py-3 font-medium text-lab-dark whitespace-nowrap">
                  {patient.patientId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
                <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
                <td className="px-4 py-3 whitespace-nowrap">{patient.doctorAssigned}</td>
                <td className="px-4 py-3 text-xs text-lab-dark underline">
                  {openId === patient.patientId
                    ? "▲ Hide"
                    : `▼ ${(patient.labReports || []).length} report(s)`}
                </td>
              </tr>

              {openId === patient.patientId && (
                <tr>
                  <td colSpan={columns.length} className="bg-lab-light px-6 py-5">
                    {(patient.labReports || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No reports submitted yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {patient.labReports.map((r, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-lab-DEFAULT rounded-md px-3 py-2 text-xs flex justify-between"
                          >
                            <span>
                              <strong>{r.test}:</strong> {r.report}
                            </span>
                            <span className="text-lab-dark font-medium">₹{r.cost}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}

export default LabTechnician;