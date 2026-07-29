import { useState } from "react";
import DataTable from "../components/DataTable";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import medicinesList from "../data/medicinesList";
import { usePatients } from "../context/PatientContext";
import EMRModal from "../components/EMRModal";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useToast } from "../context/ToastContext";
const columns = ["Patient ID", "Name", "Age", "Gender", "Diagnosis & Treatment"];

function Doctor() {
  const { patients, updatePatient } = usePatients();
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const [diagnosis, setDiagnosis] = useState("");
  const [testInput, setTestInput] = useState("");
  const [prescriptionInput, setPrescriptionInput] = useState("");
  const [medSuggestions, setMedSuggestions] = useState([]);
  const [emrPatientId, setEmrPatientId] = useState(null);
  const openPatient = (patient) => {
    setOpenId(patient.patientId);
    setDiagnosis(patient.diagnosis || "");
    setTestInput("");
    setPrescriptionInput("");
    setMedSuggestions([]);
  };

  const closePatient = () => setOpenId(null);

  const handleStartConsultation = (patientId) => {
    updatePatient(patientId, { queueStatus: "In Consultation" });
    const patient = patients.find((p) => p.patientId === patientId);
    if (patient) openPatient(patient);
  };

  const handleAddTest = (patientId) => {
    if (!testInput.trim()) return;
    updatePatient(patientId, (p) => ({
      testsRecommended: [...p.testsRecommended, testInput.trim()],
    }));
    setTestInput("");
  };

  const handlePrescriptionChange = (value) => {
    setPrescriptionInput(value);
    if (value.trim().length >= 2) {
      const matches = medicinesList.filter((m) =>
        m.toLowerCase().includes(value.toLowerCase())
      );
      setMedSuggestions(matches);
    } else {
      setMedSuggestions([]);
    }
  };

  const handleSelectMedicine = (patientId, medName) => {
    updatePatient(patientId, (p) => ({
      prescription: [...p.prescription, medName],
    }));
    setPrescriptionInput("");
    setMedSuggestions([]);
  };

  const handleAddPrescriptionManual = (patientId) => {
    if (!prescriptionInput.trim()) return;
    updatePatient(patientId, (p) => ({
      prescription: [...p.prescription, prescriptionInput.trim()],
    }));
    setPrescriptionInput("");
    setMedSuggestions([]);
  };

  const handleSaveDiagnosis = (patientId) => {
    updatePatient(patientId, (p) => ({
      diagnosis,
      ...(p.queueNumber ? { queueStatus: "Completed" } : {}),
    }));
    showToast("Patient Diagnised");
    closePatient();
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const waitingQueue = patients
    .filter((p) => p.queueStatus === "Waiting")
    .sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0));

  const inConsultation = patients.find((p) => p.queueStatus === "In Consultation");

  return (
    <DashboardLayout
      title="Doctor Dashboard"
      subtitle="Diagnose, recommend tests & prescribe"
      icon="🩺"
      colorClass="doctor"
    >
      {(waitingQueue.length > 0 || inConsultation) && (
        <div className="mb-6 bg-white border border-gray-100 rounded-card shadow-soft p-5">
          <h2 className="text-sm font-semibold text-doctor-dark mb-3">Today's Queue</h2>

          {inConsultation && (
            <div className="mb-3 flex items-center justify-between bg-doctor-light rounded-md px-4 py-2.5">
              <span className="text-sm text-doctor-dark font-medium">
                🩺 Currently with: #{inConsultation.queueNumber} — {inConsultation.name}
              </span>
              <button
                onClick={() => openPatient(inConsultation)}
                className="text-xs text-doctor-dark underline"
              >
                Open Chart
              </button>
            </div>
          )}

          {waitingQueue.length === 0 ? (
            <p className="text-xs text-gray-400">No patients currently waiting.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {waitingQueue.map((p) => (
                <div
                  key={p.patientId}
                  className="flex items-center gap-2 bg-doctor-light/60 border border-doctor-DEFAULT/30 rounded-full pl-3 pr-1.5 py-1"
                >
                  <span className="text-xs font-medium text-doctor-dark">
                    #{p.queueNumber} {p.name}
                  </span>
                  <button
                    onClick={() => handleStartConsultation(p.patientId)}
                    className="text-[11px] bg-doctor-DEFAULT text-white px-2.5 py-1 rounded-full hover:opacity-90"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="doctor" />

      <DataTable
        columns={columns}
        rows={filteredPatients}
        roleColor="doctor"
        renderRow={(patient) => (
          <>
            <tr
              key={patient.patientId}
              className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                openId === patient.patientId ? closePatient() : openPatient(patient)
              }
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
                  ? `View / Edit (${patient.diagnosis})`
                  : "▼ Add Diagnosis"}
              </td>
            </tr>

            {openId === patient.patientId && (
              <tr>
                <td colSpan={columns.length} className="bg-doctor-light px-6 py-5">
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-2">
                        Medical History
                      </label>
                      {!patient.visitHistory || patient.visitHistory.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          No previous visits recorded for this patient.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {patient.visitHistory.map((visit, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-doctor-DEFAULT/40 rounded-md px-3 py-2 text-xs"
                            >
                              <p className="font-medium text-doctor-dark mb-1">
                                {visit.date} — {visit.doctorAssigned?.name} (
                                {visit.doctorAssigned?.department})
                              </p>
                              <p className="text-gray-600">
                                Diagnosis: {visit.diagnosis || "—"}
                              </p>
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
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-1">
                        Current Diagnosis
                      </label>
                      <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT"
                        placeholder="e.g. Viral Fever"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-1">
                        Tests Recommended
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {patient.testsRecommended.length === 0 ? (
                          <span className="text-xs text-gray-400">No tests added yet</span>
                        ) : (
                          patient.testsRecommended.map((test, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-doctor-DEFAULT text-doctor-dark text-xs px-3 py-1 rounded-full"
                            >
                              {test}
                            </span>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          placeholder="e.g. Blood Test"
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT"
                        />
                        <button
                          onClick={() => handleAddTest(patient.patientId)}
                          className="bg-doctor-DEFAULT text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
                        >
                          Add Test
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-1">
                        Prescription
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {patient.prescription.length === 0 ? (
                          <span className="text-xs text-gray-400">
                            No medicines prescribed yet
                          </span>
                        ) : (
                          patient.prescription.map((med, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-doctor-DEFAULT text-doctor-dark text-xs px-3 py-1 rounded-full"
                            >
                              {med}
                            </span>
                          ))
                        )}
                      </div>
                      <div className="relative flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={prescriptionInput}
                            onChange={(e) => handlePrescriptionChange(e.target.value)}
                            placeholder="Type medicine name (e.g. Para...)"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT"
                          />
                          {medSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-card-hover z-10 overflow-hidden">
                              {medSuggestions.map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => handleSelectMedicine(patient.patientId, m)}
                                  className="block w-full text-left px-3 py-2 text-sm hover:bg-doctor-light text-gray-700"
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddPrescriptionManual(patient.patientId)}
                          className="bg-doctor-DEFAULT text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
                        >
                          Add Medicine
                        </button>
                      </div>
                    </div>
                    <button onClick={() => setEmrPatientId(patient.patientId)} className="text-xs text-doctor-dark underline self-start">
  📄 View Full EMR
</button>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveDiagnosis(patient.patientId)}
                        className="bg-doctor-dark text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90"
                      >
                        Save & Close
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </>
        )}
      />
      {emrPatientId && (
  <EMRModal patient={patients.find((p) => p.patientId === emrPatientId)} onClose={() => setEmrPatientId(null)} />
)}
    </DashboardLayout>
  );
}

export default Doctor;