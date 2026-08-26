import { useState } from "react";
import DataTable from "../components/DataTable";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { usePatients } from "../context/PatientContext";
import { useLookups } from "../hooks/useLookups";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const columns = ["Patient ID", "Name", "Age", "Gender", "Diagnosis & Treatment"];

function Doctor() {
  const { patients, refresh, getPatient } = usePatients();
    const { user } = useAuth();
  const { tests, medicines } = useLookups();
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const [diagnosis, setDiagnosis] = useState("");
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState("");
  const [selectedMedQty, setSelectedMedQty] = useState(1);
  const [prescribedMeds, setPrescribedMeds] = useState([]);
  const [history, setHistory] = useState([]);
    const [labReports, setLabReports] = useState([]);
    const openPatient = async (patient) => {
    setOpenId(patient.patient_id);
    setDiagnosis(patient.diagnosis || "");
    setSelectedTestIds([]);
    setPrescribedMeds([]);
    const full = await getPatient(patient.patient_id);
    setHistory(full.visits || []);
    try {
      const { data } = await api.get(`/lab/reports/${patient.visit_id}`);
      setLabReports(data);
    } catch (err) {
      setLabReports([]);
    }
  };

    const closePatient = () => {
    setOpenId(null);
    setLabReports([]);
  };
  const toggleTest = (testId) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const addMedicine = () => {
    if (!selectedMedId) return;
    setPrescribedMeds((prev) => [...prev, { medicine_id: selectedMedId, quantity: Number(selectedMedQty) || 1 }]);
    setSelectedMedId("");
    setSelectedMedQty(1);
  };

  const handleSaveDiagnosis = async (patient) => {
    try {
      await api.put(`/visits/${patient.visit_id}/consult`, {
        diagnosis,
        test_ids: selectedTestIds,
        medicine_ids: prescribedMeds,
      });
      await refresh();
      showToast("Patient diagnosed and saved");
      closePatient();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save", "error");
    }
  };

 const myPatients = patients.filter((p) => p.doctor_id === user?.staffId);

  const filteredPatients = myPatients.filter(
    (p) =>
      p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const waitingQueue = myPatients
    .filter((p) => p.status === "Admitted" && !p.diagnosis)
    .sort((a, b) => (a.queue_number || 0) - (b.queue_number || 0));
  return (
    <DashboardLayout title="Doctor Dashboard" subtitle="Diagnose, recommend tests & prescribe" icon="🩺" colorClass="doctor">
      {waitingQueue.length > 0 && (
        <div className="mb-6 bg-white border border-gray-100 rounded-card shadow-soft p-5">
          <h2 className="text-sm font-semibold text-doctor-dark mb-3">Today's Queue</h2>
          <div className="flex flex-wrap gap-2">
            {waitingQueue.map((p) => (
              <div key={p.patient_id} className="flex items-center gap-2 bg-doctor-light/60 border border-doctor-DEFAULT/30 rounded-full pl-3 pr-1.5 py-1">
                <span className="text-xs font-medium text-doctor-dark">#{p.queue_number} {p.full_name}</span>
                <button onClick={() => openPatient(p)} className="text-[11px] bg-doctor-DEFAULT text-white px-2.5 py-1 rounded-full hover:opacity-90">
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="doctor" />

      <DataTable
        columns={columns}
        rows={filteredPatients}
        roleColor="doctor"
        renderRow={(patient) => (
          <>
            <tr key={patient.patient_id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => (openId === patient.patient_id ? closePatient() : openPatient(patient))}>
              <td className="px-4 py-3 font-medium text-doctor-dark whitespace-nowrap">{patient.patient_id}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.full_name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
              <td className="px-4 py-3 text-xs text-doctor-dark underline">
                {openId === patient.patient_id ? "▲ Hide" : patient.diagnosis ? `View / Edit (${patient.diagnosis})` : "▼ Add Diagnosis"}
              </td>
            </tr>

            {openId === patient.patient_id && (
              <tr>
                <td colSpan={columns.length} className="bg-doctor-light px-6 py-5">
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-2">Visit History</label>
                      {history.length <= 1 ? (
                        <p className="text-xs text-gray-400">No previous visits recorded for this patient.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {history.slice(1).map((v) => (
                            <div key={v.visit_id} className="bg-white border border-doctor-DEFAULT/40 rounded-md px-3 py-2 text-xs">
                              <p className="font-medium text-doctor-dark mb-1">{v.visit_date} — {v.doctor_name} ({v.department_name})</p>
                              <p className="text-gray-600">Diagnosis: {v.diagnosis || "—"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                                        <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-2">Lab Reports</label>
                      {labReports.length === 0 ? (
                        <p className="text-xs text-gray-400">No lab reports submitted yet for this visit.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {labReports.map((r) => (
                            <div key={r.report_id} className="bg-white border border-doctor-DEFAULT/40 rounded-md px-3 py-2 text-xs">
                              <p className="font-medium text-doctor-dark mb-1">{r.test_name} — ₹{r.cost}</p>
                              <p className="text-gray-600">{r.report_text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-1">Current Diagnosis</label>
                      <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT"
                        placeholder="e.g. Viral Fever" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-1">Tests Recommended</label>
                      <div className="flex flex-wrap gap-2">
                        {tests.map((t) => (
                          <button key={t.test_id} type="button" onClick={() => toggleTest(t.test_id)}
                            className={`text-xs px-3 py-1 rounded-full border ${selectedTestIds.includes(t.test_id) ? "bg-doctor-DEFAULT text-white border-doctor-DEFAULT" : "bg-white text-doctor-dark border-doctor-DEFAULT"}`}>
                            {t.test_name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-doctor-dark block mb-1">Prescription</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {prescribedMeds.map((m, idx) => {
                          const med = medicines.find((x) => x.medicine_id === Number(m.medicine_id));
                          return (
                            <span key={idx} className="bg-white border border-doctor-DEFAULT text-doctor-dark text-xs px-3 py-1 rounded-full">
                              {med?.medicine_name} x{m.quantity}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <select value={selectedMedId} onChange={(e) => setSelectedMedId(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-doctor-DEFAULT">
                          <option value="">Select medicine</option>
                          {medicines.map((m) => (
                            <option key={m.medicine_id} value={m.medicine_id}>{m.medicine_name} (stock: {m.stock_qty})</option>
                          ))}
                        </select>
                        <input type="number" min="1" value={selectedMedQty} onChange={(e) => setSelectedMedQty(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20" />
                        <button onClick={addMedicine} className="bg-doctor-DEFAULT text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
                          Add Medicine
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button onClick={() => handleSaveDiagnosis(patient)} className="bg-doctor-dark text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90">
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
    </DashboardLayout>
  );
}

export default Doctor;