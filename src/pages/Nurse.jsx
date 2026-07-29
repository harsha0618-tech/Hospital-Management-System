import { useState } from "react";
import DataTable from "../components/DataTable";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { getTodayFormatted } from "../data/dateUtils";
import { usePatients } from "../context/PatientContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
const columns = ["Patient ID", "Name", "Age", "Gender", "Doctor", "Vitals & Notes"];

function Nurse() {
  const { patients, updatePatient } = usePatients();
  const { user } = useAuth();
const activeNurse = user?.name || "";
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [bp, setBp] = useState("");
  const [temp, setTemp] = useState("");
  const [pulse, setPulse] = useState("");
  const [notes, setNotes] = useState("");

  const openPatient = (patient) => {
    setOpenId(patient.patientId);
    setBp("");
    setTemp("");
    setPulse("");
    setNotes("");
  };

  const closePatient = () => setOpenId(null);

  const handleAddVitals = (patientId) => {
    if (!bp.trim() && !temp.trim() && !pulse.trim() && !notes.trim()) return;

    updatePatient(patientId, (p) => {
      const existingVitals = Array.isArray(p.vitals) ? p.vitals : [];
      const entry = {
        date: getTodayFormatted(),
        recordedBy: activeNurse,
        bp: bp.trim(),
        temp: temp.trim(),
        pulse: pulse.trim(),
        notes: notes.trim(),
      };
      return { vitals: [...existingVitals, entry] };
    });

    setBp("");
    setTemp("");
    setPulse("");
    setNotes("");
  };

  const nursePatients = patients.filter((p) => p.nurseAssigned === activeNurse);

  const filteredPatients = nursePatients.filter(
    (p) =>
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Nurse Dashboard"
      subtitle="Record vitals and care notes"
      icon="🩹"
      colorClass="nurse"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Logged in as</label>
        <select
          value={activeNurse}
          onChange={(e) => setActiveNurse(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT w-fit"
        >
          {nursesList.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="nurse" />

      <DataTable
        columns={columns}
        rows={filteredPatients}
        roleColor="nurse"
        renderRow={(patient) => (
          <>
            <tr
              key={patient.patientId}
              className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                openId === patient.patientId ? closePatient() : openPatient(patient)
              }
            >
              <td className="px-4 py-3 font-medium text-nurse-dark whitespace-nowrap">
                {patient.patientId}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.doctorAssigned?.name}</td>
              <td className="px-4 py-3 text-xs text-nurse-dark underline">
                {openId === patient.patientId
                  ? "▲ Hide"
                  : patient.vitals?.length > 0
                  ? `▼ ${patient.vitals.length} record(s)`
                  : "▼ Add Vitals"}
              </td>
            </tr>

            {openId === patient.patientId && (
              <tr>
                <td colSpan={columns.length} className="bg-nurse-light px-6 py-5">
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="text-sm font-medium text-nurse-dark block mb-2">
                        Vitals History
                      </label>
                      {!patient.vitals || patient.vitals.length === 0 ? (
                        <p className="text-xs text-gray-400">No vitals recorded yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {patient.vitals.map((v, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-nurse-DEFAULT/40 rounded-md px-3 py-2 text-xs"
                            >
                              <p className="font-medium text-nurse-dark mb-1">
                                {v.date} — {v.recordedBy}
                              </p>
                              <p className="text-gray-600">
                                BP: {v.bp || "—"} • Temp: {v.temp || "—"} • Pulse: {v.pulse || "—"}
                              </p>
                              {v.notes && <p className="text-gray-600">Notes: {v.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-nurse-dark block mb-1">
                        Record New Vitals
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                        <input
                          type="text"
                          value={bp}
                          onChange={(e) => setBp(e.target.value)}
                          placeholder="BP (e.g. 120/80)"
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT"
                        />
                        <input
                          type="text"
                          value={temp}
                          onChange={(e) => setTemp(e.target.value)}
                          placeholder="Temp (e.g. 98.6°F)"
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT"
                        />
                        <input
                          type="text"
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value)}
                          placeholder="Pulse (e.g. 72 bpm)"
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT"
                        />
                      </div>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Care notes / observations"
                        rows={2}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleAddVitals(patient.patientId)}
                        className="bg-nurse-dark text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90"
                      >
                        Save Vitals
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

export default Nurse;