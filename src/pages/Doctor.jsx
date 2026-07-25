import { useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import mockPatients from "../data/mockPatients";

const columns = ["Patient ID", "Name", "Age", "Gender", "Diagnosis & Treatment"];

function Doctor() {
  const [patients, setPatients] = useState(mockPatients);
  const [openId, setOpenId] = useState(null);

  // Top form state
  const [formPatientId, setFormPatientId] = useState("");
  const [formDiagnosis, setFormDiagnosis] = useState("");
  const [formTest, setFormTest] = useState("");
  const [formPrescription, setFormPrescription] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formPatientId) return;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId !== formPatientId) return p;
        return {
          ...p,
          diagnosis: formDiagnosis.trim() || p.diagnosis,
          testsRecommended: formTest.trim()
            ? [...p.testsRecommended, formTest.trim()]
            : p.testsRecommended,
          prescription: formPrescription.trim()
            ? [...p.prescription, formPrescription.trim()]
            : p.prescription,
        };
      })
    );

    setFormPatientId("");
    setFormDiagnosis("");
    setFormTest("");
    setFormPrescription("");
  };

  const openPatient = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Doctor Dashboard"
          subtitle="Diagnose, recommend tests & prescribe"
          icon="🩺"
          colorClass="doctor"
        />

        {/* Add Entry Form */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Add Diagnosis / Treatment
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
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT"
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
                Diagnosis
              </label>
              <input
                type="text"
                value={formDiagnosis}
                onChange={(e) => setFormDiagnosis(e.target.value)}
                placeholder="e.g. Viral Fever"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Test Recommended
              </label>
              <input
                type="text"
                value={formTest}
                onChange={(e) => setFormTest(e.target.value)}
                placeholder="e.g. Blood Test"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Prescription
              </label>
              <input
                type="text"
                value={formPrescription}
                onChange={(e) => setFormPrescription(e.target.value)}
                placeholder="e.g. Paracetamol 500mg"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT"
              />
            </div>

            <div className="lg:col-span-4 flex justify-end mt-1">
              <button
                type="submit"
                className="bg-doctor-DEFAULT text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-doctor-dark transition"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
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
                <td className="px-4 py-3 font-medium text-doctor-dark whitespace-nowrap">
                  {patient.patientId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
                <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
                <td className="px-4 py-3 text-xs text-doctor-dark underline">
                  {openId === patient.patientId
                    ? "▲ Hide"
                    : patient.diagnosis
                    ? `View (${patient.diagnosis})`
                    : "▼ View details"}
                </td>
              </tr>

              {openId === patient.patientId && (
                <tr>
                  <td colSpan={columns.length} className="bg-doctor-light px-6 py-5">
                    <div className="flex flex-col gap-3 text-sm">
                      <p>
                        <strong className="text-doctor-dark">Diagnosis:</strong>{" "}
                        {patient.diagnosis || "Not added yet"}
                      </p>
                      <div>
                        <strong className="text-doctor-dark">Tests:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {patient.testsRecommended.length === 0 ? (
                            <span className="text-xs text-gray-400">None</span>
                          ) : (
                            patient.testsRecommended.map((t, i) => (
                              <span
                                key={i}
                                className="bg-white border border-doctor-DEFAULT text-doctor-dark text-xs px-3 py-1 rounded-full"
                              >
                                {t}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <strong className="text-doctor-dark">Prescription:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {patient.prescription.length === 0 ? (
                            <span className="text-xs text-gray-400">None</span>
                          ) : (
                            patient.prescription.map((m, i) => (
                              <span
                                key={i}
                                className="bg-white border border-doctor-DEFAULT text-doctor-dark text-xs px-3 py-1 rounded-full"
                              >
                                {m}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
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

export default Doctor;