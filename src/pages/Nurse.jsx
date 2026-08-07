import { useState } from "react";
import DataTable from "../components/DataTable";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { usePatients } from "../context/PatientContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const columns = ["Patient ID", "Name", "Age", "Gender", "Doctor", "Vitals & Notes"];

function Nurse() {
  const { patients } = usePatients();
  const { user } = useAuth();
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [vitalsList, setVitalsList] = useState([]);

  const [bp, setBp] = useState("");
  const [temp, setTemp] = useState("");
  const [pulse, setPulse] = useState("");
  const [notes, setNotes] = useState("");

  const loadVitals = async (visitId) => {
    const { data } = await api.get(`/nurse/vitals/${visitId}`);
    setVitalsList(data);
  };

  const openPatient = async (patient) => {
    setOpenId(patient.patient_id);
    setBp(""); setTemp(""); setPulse(""); setNotes("");
    await loadVitals(patient.visit_id);
  };

  const closePatient = () => setOpenId(null);

  const handleAddVitals = async (patient) => {
    if (!bp.trim() && !temp.trim() && !pulse.trim() && !notes.trim()) return;
    await api.post("/nurse/vitals", {
      visit_id: patient.visit_id,
      nurse_id: user?.staffId,
      bp, temperature: temp, pulse, notes,
    });
    setBp(""); setTemp(""); setPulse(""); setNotes("");
    await loadVitals(patient.visit_id);
  };

  const nursePatients = patients.filter((p) => p.nurse_id === user?.staffId);
  const filteredPatients = nursePatients.filter(
    (p) =>
      p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Nurse Dashboard" subtitle="Record vitals and care notes" icon="🩹" colorClass="nurse">
      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="nurse" />

      <DataTable
        columns={columns}
        rows={filteredPatients}
        roleColor="nurse"
        renderRow={(patient) => (
          <>
            <tr key={patient.patient_id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => (openId === patient.patient_id ? closePatient() : openPatient(patient))}>
              <td className="px-4 py-3 font-medium text-nurse-dark whitespace-nowrap">{patient.patient_id}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.full_name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.doctor_name}</td>
              <td className="px-4 py-3 text-xs text-nurse-dark underline">
                {openId === patient.patient_id ? "▲ Hide" : "▼ Vitals"}
              </td>
            </tr>

            {openId === patient.patient_id && (
              <tr>
                <td colSpan={columns.length} className="bg-nurse-light px-6 py-5">
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="text-sm font-medium text-nurse-dark block mb-2">Vitals History</label>
                      {vitalsList.length === 0 ? (
                        <p className="text-xs text-gray-400">No vitals recorded yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {vitalsList.map((v) => (
                            <div key={v.vitals_id} className="bg-white border border-nurse-DEFAULT/40 rounded-md px-3 py-2 text-xs">
                              <p className="font-medium text-nurse-dark mb-1">{new Date(v.recorded_at).toLocaleString()}</p>
                              <p className="text-gray-600">BP: {v.bp || "—"} • Temp: {v.temperature || "—"} • Pulse: {v.pulse || "—"}</p>
                              {v.notes && <p className="text-gray-600">Notes: {v.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-nurse-dark block mb-1">Record New Vitals</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                        <input type="text" value={bp} onChange={(e) => setBp(e.target.value)} placeholder="BP (e.g. 120/80)"
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT" />
                        <input type="text" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Temp (e.g. 98.6°F)"
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT" />
                        <input type="text" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="Pulse (e.g. 72 bpm)"
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT" />
                      </div>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Care notes / observations" rows={2}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-nurse-DEFAULT" />
                    </div>

                    <div className="flex justify-end">
                      <button onClick={() => handleAddVitals(patient)} className="bg-nurse-dark text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90">
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